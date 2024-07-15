const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

const auth = "ljum9HxQ7wvJGPqrjNWxNUrrQJve4sE65N9Avz_7WxY";

app.use(express.static("public"));

app.get("/api/channels/:groupSlug", async (req, res) => {
  const groupSlug = req.params.groupSlug;
  try {
    const response = await fetch(
      `https://api.are.na/v2/groups/${groupSlug}/channels`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/channel-contents/:channelId", async (req, res) => {
  const channelId = req.params.channelId;
  try {
    const response = await fetch(
      `https://api.are.na/v2/channels/${channelId}/contents`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
