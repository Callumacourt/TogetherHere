import { useState } from "react";
import { useEffect } from "react";

export default function useImageIntake () {
    const [imageUrl, setImgUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const imgFile = e.target.files?.[0];
        if (!imgFile) return;

        const url = URL.createObjectURL(imgFile);
        setImgUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });
    };

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
    }, [imageUrl]);

    return {
        imageUrl: imageUrl,
        setImgUrl: setImgUrl,
        handleFileChange: handleFileChange,
    }
}