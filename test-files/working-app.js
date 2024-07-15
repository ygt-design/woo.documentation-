let auth = "ljum9HxQ7wvJGPqrjNWxNUrrQJve4sE65N9Avz_7WxY";
let highestZIndex = 100;

const createCloseButton = (parentDiv) => {
  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => {
    parentDiv.remove();
  });
  return closeButton;
};

const setHighestZIndex = (element) => {
  highestZIndex++;
  element.style.zIndex = highestZIndex;
};

const createChannelDivs = (channels) => {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.innerHTML = "";

  const filteredChannels = channels.filter(
    (channel) => !channel.title.startsWith("!")
  );
  filteredChannels.sort((a, b) => a.title.localeCompare(b.title));

  filteredChannels.forEach((channel) => {
    const div = document.createElement("div");
    div.className = "channel-title";
    div.textContent = channel.title;
    div.addEventListener("click", () => {
      showChannelContentWithLoading(channel.id);
      document.querySelector(".menu").classList.remove("show");
      dropdownContent.style.display = "none";
    });
    dropdownContent.appendChild(div);
  });
};

const showChannelContentWithLoading = (channelId) => {
  const container = document.querySelector(".container");

  const channelContentDiv = document.createElement("div");
  channelContentDiv.className = "channel-content";
  channelContentDiv.style.top = "50px";
  channelContentDiv.style.right = "50px";
  channelContentDiv.style.position = "fixed";

  const closeButton = createCloseButton(channelContentDiv);
  channelContentDiv.appendChild(closeButton);

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.textContent = "Loading...";
  channelContentDiv.appendChild(loadingIndicator);

  container.appendChild(channelContentDiv);
  channelContentDiv.style.display = "block";

  if (window.makeDraggable) {
    window.makeDraggable(channelContentDiv);
  }
  setHighestZIndex(channelContentDiv);

  channelContentDiv.addEventListener("mousedown", () => {
    setHighestZIndex(channelContentDiv);
  });

  fetchChannelContent(channelId, channelContentDiv, loadingIndicator);
};

const fetchChannelContent = async (
  channelId,
  channelContentDiv,
  loadingIndicator
) => {
  try {
    const response = await fetch(
      `https://api.are.na/v2/channels/${channelId}/contents`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Cache-Control": "no-store, max-age=0, no-cache",
          referrerPolicy: "no-referrer",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayChannelContent(data.contents, channelContentDiv, loadingIndicator);
  } catch (error) {
    console.error("Error fetching channel content:", error);
    loadingIndicator.textContent = "Failed to load content";
  }
};

const displayChannelContent = (
  contents,
  channelContentDiv,
  loadingIndicator
) => {
  channelContentDiv.removeChild(loadingIndicator);

  if (contents.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-content";
    emptyDiv.textContent = "THERE IS NOTHING TO SEE HERE YET :(";
    channelContentDiv.appendChild(emptyDiv);
  } else {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "content-wrapper";

    contents.forEach((content) => {
      const contentDiv = document.createElement("div");
      contentDiv.className = "content";

      const timestamp = new Date(content.created_at).toLocaleString();
      let contentHTML = "";

      if (content.class === "Image") {
        contentHTML = `<img src="${content.image.original.url}" alt="${
          content.title || "Image"
        }">`;
      } else if (content.class === "Link") {
        contentHTML = `
          <a href="${content.source.url}" target="_blank">
            <img src="${content.image.display.url}" alt="${
          content.title || "Link Preview"
        }">
          </a>
        `;
      } else {
        contentHTML = `<p>${content.title || content.content}</p>`;
      }

      contentDiv.innerHTML = `
        <div class="content-main">${contentHTML}</div>
        <div class="content-timestamp">${timestamp}</div>
      `;
      wrapperDiv.appendChild(contentDiv);
    });

    channelContentDiv.appendChild(wrapperDiv);
  }
};

const displayAboutContent = () => {
  const container = document.querySelector(".container");

  const aboutContentDiv = document.createElement("div");
  aboutContentDiv.className = "channel-content";
  aboutContentDiv.style.top = "50px";
  aboutContentDiv.style.right = "50px";
  aboutContentDiv.style.position = "fixed";

  const closeButton = createCloseButton(aboutContentDiv);
  aboutContentDiv.appendChild(closeButton);

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.textContent = "Loading...";
  aboutContentDiv.appendChild(loadingIndicator);

  container.appendChild(aboutContentDiv);
  aboutContentDiv.style.display = "block";

  if (window.makeDraggable) {
    window.makeDraggable(aboutContentDiv);
  }
  setHighestZIndex(aboutContentDiv);

  aboutContentDiv.addEventListener("mousedown", () => {
    setHighestZIndex(aboutContentDiv);
  });

  setTimeout(() => {
    aboutContentDiv.removeChild(loadingIndicator);
    aboutContentDiv.innerHTML += `
      <h1>About</h1>
      <p>How a website can engage with live performance, documentation and archives, and be a platform to curate, present and perform, and a possible portal for connection and resource sharing. While this project holds an objective of producing a work, it will be research-lead with priorities of learning, experimentation, collaboration and creative process.</p>
    `;
  }, 1000);
};

const fetchGroupChannels = async (groupSlug) => {
  try {
    const response = await fetch(
      `https://api.are.na/v2/groups/${groupSlug}/channels`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Cache-Control": "no-store, max-age=0, no-cache",
          referrerPolicy: "no-referrer",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    createChannelDivs(data.channels);
  } catch (error) {
    console.error("Error fetching group channels:", error);
  }
};

const fetchGroupContents = async (groupSlug) => {
  try {
    const channelsResponse = await fetch(
      `https://api.are.na/v2/groups/${groupSlug}/channels`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Cache-Control": "no-store, max-age=0, no-cache",
          referrerPolicy: "no-referrer",
        },
      }
    );
    if (!channelsResponse.ok) {
      throw new Error(`HTTP error! status: ${channelsResponse.status}`);
    }
    const channelsData = await channelsResponse.json();
    const allContents = [];
    for (const channel of channelsData.channels) {
      const contentsResponse = await fetch(
        `https://api.are.na/v2/channels/${channel.id}/contents`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Cache-Control": "no-store, max-age=0, no-cache",
            referrerPolicy: "no-referrer",
          },
        }
      );
      if (contentsResponse.ok) {
        const contentsData = await contentsResponse.json();
        allContents.push(...contentsData.contents);
      }
    }
    displayChannelContentWithTimestamp(allContents);
  } catch (error) {
    console.error("Error fetching group contents:", error);
  }
};

const displayChannelContentWithTimestamp = (contents) => {
  const container = document.querySelector(".container");

  const channelContentDiv = document.createElement("div");
  channelContentDiv.className = "channel-content";
  channelContentDiv.style.top = "0px";
  channelContentDiv.style.right = "0px";
  channelContentDiv.style.position = "fixed";

  const closeButton = createCloseButton(channelContentDiv);
  channelContentDiv.appendChild(closeButton);

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.textContent = "Loading...";
  channelContentDiv.appendChild(loadingIndicator);

  container.appendChild(channelContentDiv);
  channelContentDiv.style.display = "block";

  if (window.makeDraggable) {
    window.makeDraggable(channelContentDiv);
  }
  setHighestZIndex(channelContentDiv);

  channelContentDiv.addEventListener("mousedown", () => {
    setHighestZIndex(channelContentDiv);
  });

  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = "content-wrapper";

  if (contents.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-content";
    emptyDiv.textContent = "THERE IS NOTHING TO SEE HERE YET :(";
    wrapperDiv.appendChild(emptyDiv);
  } else {
    contents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    contents.forEach((content) => {
      const contentDiv = document.createElement("div");
      contentDiv.className = "content";

      const timestamp = new Date(content.created_at).toLocaleString();
      let contentHTML = "";

      if (content.class === "Image") {
        contentHTML = `<img src="${content.image.original.url}" alt="${
          content.title || "Image"
        }">`;
      } else if (content.class === "Link") {
        contentHTML = `
          <a href="${content.source.url}" target="_blank">
            <img src="${content.image.display.url}" alt="${
          content.title || "Link Preview"
        }">
          </a>
        `;
      } else {
        contentHTML = `<p>${content.title} <br> <br> ${content.content}</p>`;
      }

      contentDiv.innerHTML = `
        <div class="content-main">${contentHTML}</div>
        <div class="content-timestamp">${timestamp}</div>
      `;
      wrapperDiv.appendChild(contentDiv);
    });
  }

  channelContentDiv.appendChild(wrapperDiv);
  channelContentDiv.removeChild(loadingIndicator);
};

fetchGroupChannels("woo-fun");

document.querySelector(".dropdown-btn").addEventListener("click", () => {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.style.display =
    dropdownContent.style.display === "block" ? "none" : "block";
});

document.querySelector(".about-btn").addEventListener("click", () => {
  displayAboutContent();
});

document.querySelector(".documentation-btn").addEventListener("click", () => {
  fetchGroupContents("woo-fun");
});
