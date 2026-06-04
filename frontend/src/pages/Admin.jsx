import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

const RECIPE_ACTIONS = {
  pending: [
    { label: "Approve", nextStatus: "approved" },
    { label: "Reject", nextStatus: "rejected" },
  ],
  approved: [{ label: "Unpublish", nextStatus: "pending" }],
  rejected: [{ label: "Reapprove", nextStatus: "approved" }],
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

function getRecipeActions(status) {
  return RECIPE_ACTIONS[status] || [];
}

async function patchRecipeStatus(recipeId, status) {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to update recipe status");
  }

  return data;
}

// Render status chip in diff colors for each recipe
function RecipeStatusChip({ status }) {
  const label = STATUS_LABELS[status] || "Pending";

  return (
    <Chip
      label={label}
      size="small"
      className={`admin-page__status-chip admin-page__status-chip--${status || "pending"}`}
    />
  );
}

function SubmittedRecipesTable({
  recipes,
  loading,
  updatingRecipeId,
  onAction,
}) {
  const columnCount = 4;

  return (
    <TableContainer className="admin-page__table-container">
      <Table className="admin-page__table" aria-label="Submitted recipes">
        <TableHead>
          <TableRow>
            <TableCell className="admin-page__table-head-cell">Recipe</TableCell>
            <TableCell className="admin-page__table-head-cell">Submitted by</TableCell>
            <TableCell className="admin-page__table-head-cell">Status</TableCell>
            <TableCell className="admin-page__table-head-cell admin-page__table-head-cell--actions">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="admin-page__table-message-cell">
                <CircularProgress size={28} className="admin-page__table-spinner" />
                <Typography variant="body2">Loading recipes...</Typography>
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && recipes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="admin-page__table-message-cell">
                <Typography variant="body1">
                  No recipes match your search or filter.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? recipes.map((recipe) => {
                const actions = getRecipeActions(recipe.status);
                const isUpdating = updatingRecipeId === recipe.id;

                return (
                  <TableRow key={recipe.id} className="admin-page__table-row">
                    <TableCell className="admin-page__table-cell">
                      <div className="admin-page__recipe-cell">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt=""
                            className="admin-page__recipe-image"
                          />
                        ) : (
                          <div className="admin-page__recipe-image admin-page__recipe-image--placeholder">
                            <Typography variant="caption" component="span">
                              No image
                            </Typography>
                          </div>
                        )}
                        <Typography
                          variant="subtitle2"
                          component="span"
                          className="admin-page__recipe-title"
                        >
                          {recipe.title}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell className="admin-page__table-cell">
                      <Typography variant="body2">{recipe.submittedBy}</Typography>
                    </TableCell>
                    <TableCell className="admin-page__table-cell">
                      <RecipeStatusChip status={recipe.status} />
                    </TableCell>
                    <TableCell className="admin-page__table-cell admin-page__table-cell--actions">
                      <div className="admin-page__actions">
                        {actions.map((action) => (
                          <Button
                            key={`${recipe.id}-${action.label}`}
                            type="button"
                            variant="outlined"
                            size="small"
                            disabled={isUpdating}
                            className={`admin-page__action-button admin-page__action-button--${action.label.toLowerCase()}`}
                            onClick={() =>
                              onAction(recipe.id, action.nextStatus, recipe.status)
                            }
                          >
                            {isUpdating ? "Saving..." : action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
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
  const [updatingRecipeId, setUpdatingRecipeId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [searchInput]);

  async function loadDashboardStats({ showLoading = true } = {}) {
    if (showLoading) {
      setStatsLoading(true);
    }
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

      setCounts({
        ...recipeCounts,
        users: Number(usersData.count) || 0,
      });
    } catch (err) {
      setCounts(EMPTY_COUNTS);
      setStatsError(err.message || "Unable to load admin dashboard stats");
    } finally {
      if (showLoading) {
        setStatsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadDashboardStats();
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

  function applyRecipeCountsUpdate(previousStatus, nextStatus) {
    if (!previousStatus || previousStatus === nextStatus) {
      return;
    }

    setCounts((current) => {
      const nextCounts = { ...current };

      if (previousStatus in nextCounts && nextCounts[previousStatus] > 0) {
        nextCounts[previousStatus] -= 1;
      }

      if (nextStatus in nextCounts) {
        nextCounts[nextStatus] += 1;
      }

      return nextCounts;
    });
  }

  async function handleRecipeAction(recipeId, nextStatus, previousStatus) {
    setUpdatingRecipeId(recipeId);
    setActionError("");
    setActionSuccess("");

    try {
      const updatedRecipe = await patchRecipeStatus(recipeId, nextStatus);

      setRecipes((current) => {
        if (statusFilter && updatedRecipe.status !== statusFilter) {
          return current.filter((recipe) => recipe.id !== recipeId);
        }

        return current.map((recipe) =>
          recipe.id === recipeId ? updatedRecipe : recipe,
        );
      });

      applyRecipeCountsUpdate(previousStatus, updatedRecipe.status);
      setActionSuccess(
        `"${updatedRecipe.title}" marked as ${STATUS_LABELS[updatedRecipe.status] || updatedRecipe.status}.`,
      );
    } catch (err) {
      setActionError(err.message || "Unable to update recipe status");
    } finally {
      setUpdatingRecipeId(null);
    }
  }

  const filterLabel = statusFilter ? STATUS_LABELS[statusFilter] : null;
  const resultSummary = recipesLoading
    ? "Loading recipes..."
    : `${recipes.length} recipe${recipes.length === 1 ? "" : "s"} found`;

  return (
    <main className="admin-page">
      <div className="admin-page__inner">
        <header className="admin-page__header">
          <Typography
            variant="h3"
            component="h1"
            className="admin-page__title"
          >
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" className="admin-page__subtitle">
            Review community recipe submissions
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

          {actionSuccess ? (
            <Alert
              severity="success"
              className="admin-page__recipes-feedback"
              onClose={() => setActionSuccess("")}
            >
              {actionSuccess}
            </Alert>
          ) : null}

          {actionError ? (
            <Alert
              severity="error"
              className="admin-page__recipes-feedback"
              onClose={() => setActionError("")}
            >
              {actionError}
            </Alert>
          ) : null}

          {recipesError ? (
            <Alert severity="error" className="admin-page__recipes-error">
              {recipesError}
            </Alert>
          ) : null}

          {!recipesError ? (
            <SubmittedRecipesTable
              recipes={recipes}
              loading={recipesLoading}
              updatingRecipeId={updatingRecipeId}
              onAction={handleRecipeAction}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
