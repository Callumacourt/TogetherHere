import { useEffect, useState } from "react";

type ImageDimensions = {
    width: number;
    height: number;
};

type FocusPoint = {
    x: number;
    y: number;
};

export default function useImageIntake () {
    const [imageUrl, setImgUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
    const [focus, setFocus] = useState<FocusPoint>({ x: 50, y: 50 });

    const clearImage = () => {
        setImgUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setDimensions(null);
        setFocus({ x: 50, y: 50 });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const imgFile = e.target.files?.[0];
        if (!imgFile) return;
        setImageFile(imgFile);

        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }

        const url = URL.createObjectURL(imgFile);
        const preview = new window.Image();

        preview.onload = () => {
            const nextDimensions = {
                width: preview.naturalWidth,
                height: preview.naturalHeight,
            };

            setDimensions({
                width: nextDimensions.width,
                height: nextDimensions.height,
            });

            const isPortrait = nextDimensions.height > nextDimensions.width;
            setFocus(isPortrait ? { x: 50, y: 38 } : { x: 50, y: 50 });
        };

        preview.src = url;
        setImgUrl(url);
    };

    const aspectRatio = dimensions ? dimensions.width / dimensions.height : null;
    const objectPosition = `${focus.x}% ${focus.y}%`;

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
    }, [imageUrl]);

    return {
        imageUrl: imageUrl,
        file: imageFile,
        clearImage,
        handleFileChange: handleFileChange,
        dimensions,
        aspectRatio,
        focus,
        setFocus,
        objectPosition,
    }
}