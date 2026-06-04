import { useRef, useState } from "react";
import { Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function ImageDropzone({ onImageSelect }) {
  const imageInputRef = useRef(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function applySelectedImageFile(imageFile) {
    if (!imageFile) return;
    setSelectedImageFile(imageFile);
    setImagePreviewUrl(URL.createObjectURL(imageFile));
    onImageSelect(imageFile);
  }

  function handleImageSelect(event) {
    applySelectedImageFile(event.target.files[0]);
  }

  function handleDropzoneClick() {
    imageInputRef.current.click();
  }

  function handleDropzoneDragOver(event) {
    event.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDropzoneDragLeave() {
    setIsDraggingOver(false);
  }

  function handleDropzoneDrop(event) {
    event.preventDefault();
    setIsDraggingOver(false);
    applySelectedImageFile(event.dataTransfer.files[0]);
  }

  return (
    <div
      className={`create-recipe__image-dropzone ${isDraggingOver ? "create-recipe__image-dropzone--dragging" : ""}`}
      onClick={handleDropzoneClick}
      onDragOver={handleDropzoneDragOver}
      onDragLeave={handleDropzoneDragLeave}
      onDrop={handleDropzoneDrop}
    >
      <CloudUploadIcon className="create-recipe__dropzone-icon" />
      <Typography className="create-recipe__dropzone-text">
        {selectedImageFile
          ? selectedImageFile.name
          : "Drop image here or click to upload"}
      </Typography>
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Recipe preview"
          className="create-recipe__image-preview"
        />
      )}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="create-recipe__file-input"
      />
    </div>
  );
}
