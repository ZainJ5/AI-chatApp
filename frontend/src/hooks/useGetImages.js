// useGetImages.js
import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetImages = () => {
  const [loading, setLoading] = useState(false);
  const { images, setImages, selectedConversation } = useConversation();

  useEffect(() => {
    const getImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Filter messages to get only images
        const imageMessages = data.filter((message) => message.type === "image");
        setImages(imageMessages);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getImages();
  }, [selectedConversation?._id, setImages]);

  return { images, loading };
};

export default useGetImages;
