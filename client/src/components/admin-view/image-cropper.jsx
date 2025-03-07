import { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

function ImageCropper({ image, onCropComplete, aspect = 1 }) {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const [open, setOpen] = useState(true);

  const onImageLoad = (img) => {
    setImgRef(img);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imgRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = "cropped.jpeg";
          const croppedImage = new File([blob], "cropped.jpeg", {
            type: "image/jpeg",
          });
          resolve(croppedImage);
        },
        "image/jpeg",
        1
      );
    });
  };

  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    onCropComplete(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="max-h-[500px] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                src={image instanceof File ? URL.createObjectURL(image) : image}
                onLoad={(e) => onImageLoad(e.currentTarget)}
                alt="Crop me"
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete}>Apply Crop</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCropper;
