const getPlantImage = async (req, res) => {
  const { query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ message: "Image query is required" });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        `${query} plant`
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to fetch image from Unsplash",
      });
    }

    const data = await response.json();

    const imageUrl =
      data.results?.[0]?.urls?.regular ||
      data.results?.[0]?.urls?.small ||
      "";

    return res.json({ imageUrl });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching image",
    });
  }
};

module.exports = { getPlantImage };