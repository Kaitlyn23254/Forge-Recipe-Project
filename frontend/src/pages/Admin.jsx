import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import "../styles/Admin.css";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5005";
const SEARCH_DEBOUNCE_MS = 300;

const SUMMARY_CARDS = [
  {
    key: "pending",
    label: "Pending",
    icon: HourglassEmptyIcon,
    filtersRecipes: true,
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircleOutlinedIcon,
    filtersRecipes: true,
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: CancelOutlinedIcon,
    filtersRecipes: true,
  },
  {
    key: "users",
    label: "Users",
    icon: PeopleOutlinedIcon,
    filtersRecipes: false,
  },
];

const EMPTY_COUNTS = {
  pending: 0,
  approved: 0,
  rejected: 0,
  users: 0,
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function countRecipesByStatus(recipes) {
  return recipes.reduce(
    (counts, recipe) => {
      const status = recipe.status || "pending";
      if (status in counts) {
        counts[status] += 1;
      }
      return counts;
    },
    { pending: 0, approved: 0, rejected: 0 },
  );
}

// Turns the search text into backend URL for loading recipes
function buildAdminRecipesUrl({ search, status }) {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  return `${API_BASE_URL}/recipes/admin${query ? `?${query}` : ""}`;
}

// Render summary cards and make them filters on click
function SummaryCard({ card, value, loading, isActive, onSelect }) {
  const Icon = card.icon;
  const isClickable = card.filtersRecipes;

  function handleClick() {
    if (isClickable) {
      onSelect(card.key);
    }
  }

  function handleKeyDown(event) {
    if (!isClickable) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(card.key);
    }
  }

  return (
    <Card
      className={[
        "admin-page__card",
        `admin-page__card--${card.key}`,
        isClickable ? "admin-page__card--clickable" : "",
        isActive ? "admin-page__card--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? isActive : undefined}
    >
      <CardContent className="admin-page__card-content">
        <div className="admin-page__card-body">
          <div>
            <Typography
              component="span"
              variant="overline"
              className="admin-page__card-label"
            >
              {card.label}
            </Typography>
            <Typography component="p" variant="h4" className="admin-page__card-value">
              {loading ? (
                <CircularProgress
                  size={28}
                  className="admin-page__card-spinner"
                />
              ) : (
                value
              )}
            </Typography>
          </div>
          <div className="admin-page__card-icon" aria-hidden="true">
            <Icon fontSize="medium" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState("");

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      setStatsLoading(true);
      setStatsError("");

      try {
        const [recipesResponse, usersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/recipes/admin`),
          fetch(`${API_BASE_URL}/users/count`),
        ]);

        const recipesData = await recipesResponse.json();
        const usersData = await usersResponse.json();

        if (!recipesResponse.ok) {
          throw new Error(recipesData.error || "Unable to load recipe stats");
        }

        if (!usersResponse.ok) {
          throw new Error(usersData.error || "Unable to load user count");
        }

        const recipeCounts = countRecipesByStatus(
          Array.isArray(recipesData) ? recipesData : [],
        );

        if (isMounted) {
          setCounts({
            ...recipeCounts,
            users: Number(usersData.count) || 0,
          });
        }
      } catch (err) {
        if (isMounted) {
          setCounts(EMPTY_COUNTS);
          setStatsError(err.message || "Unable to load admin dashboard stats");
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function loadSubmittedRecipes() {
      setRecipesLoading(true);
      setRecipesError("");

      try {
        const response = await fetch(
          buildAdminRecipesUrl({
            search: searchQuery,
            status: statusFilter,
          }),
          { signal: abortController.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load submitted recipes");
        }

        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        if (isMounted) {
          setRecipes([]);
          setRecipesError(err.message || "Unable to load submitted recipes");
        }
      } finally {
        if (isMounted) {
          setRecipesLoading(false);
        }
      }
    }

    loadSubmittedRecipes();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [searchQuery, statusFilter]);

  const displayCounts = useMemo(
    () => ({
      pending: counts.pending,
      approved: counts.approved,
      rejected: counts.rejected,
      users: counts.users,
    }),
    [counts],
  );

  function handleStatusCardSelect(status) {
    setStatusFilter((current) => (current === status ? null : status));
  }

  const filterLabel = statusFilter ? STATUS_LABELS[statusFilter] : null;
  const resultSummary = recipesLoading
    ? "Loading recipes..."
    : `${recipes.length} recipe${recipes.length === 1 ? "" : "s"} found`;

  return (
    <main className="admin-page">
      <div className="admin-page__inner">
        <header className="admin-page__header">
          <Typography variant="overline" className="admin-page__eyebrow">
            CookIt Admin
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            className="admin-page__title"
          >
            Dashboard
          </Typography>
          <Typography variant="subtitle1" className="admin-page__subtitle">
            Review community recipe submissions and track moderation activity at
            a glance.
          </Typography>
        </header>

        {statsError ? (
          <Alert severity="error" className="admin-page__error">
            {statsError}
          </Alert>
        ) : null}

        <section className="admin-page__cards" aria-label="Dashboard summary">
          {SUMMARY_CARDS.map((card) => (
            <SummaryCard
              key={card.key}
              card={card}
              value={displayCounts[card.key]}
              loading={statsLoading}
              isActive={card.filtersRecipes && statusFilter === card.key}
              onSelect={handleStatusCardSelect}
            />
          ))}
        </section>

        <section className="admin-page__recipes" aria-labelledby="admin-recipes-heading">
          <Typography
            id="admin-recipes-heading"
            variant="h4"
            component="h2"
            className="admin-page__section-title"
          >
            Submitted recipes
          </Typography>

          <TextField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by recipe title, submitter, or status"
            fullWidth
            className="admin-page__search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="admin-page__search-icon" />
                </InputAdornment>
              ),
            }}
          />

          <div className="admin-page__recipes-meta">
            <Typography variant="body2" className="admin-page__recipes-count">
              {resultSummary}
            </Typography>
            {filterLabel ? (
              <Typography variant="body2" className="admin-page__recipes-filter">
                Filtered by {filterLabel}
                <button
                  type="button"
                  className="admin-page__clear-filter"
                  onClick={() => setStatusFilter(null)}
                >
                  Clear filter
                </button>
              </Typography>
            ) : null}
          </div>

          {recipesError ? (
            <Alert severity="error" className="admin-page__recipes-error">
              {recipesError}
            </Alert>
          ) : null}

          {!recipesLoading && !recipesError && recipes.length === 0 ? (
            <Typography variant="body1" className="admin-page__recipes-empty">
              No recipes match your search or filter.
            </Typography>
          ) : null}
        </section>
      </div>
    </main>
  );
}
