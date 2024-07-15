const createTree = (container, contents) => {
  const channels = {};
  contents.forEach((content) => {
    if (!channels[content.channel_id]) {
      channels[content.channel_id] = [];
    }
    channels[content.channel_id].push(content);
  });

  Object.keys(channels).forEach((channelId, rowIndex) => {
    const channelContents = channels[channelId].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const channelRow = document.createElement("div");
    channelRow.className = "channel-row";
    channelRow.style.position = "relative";
    channelRow.style.top = `${currentTop}px`;

    const channelLabel = document.createElement("div");
    channelLabel.className = "channel-label";
    channelLabel.textContent = `Channel: ${channelId}`;
    channelLabel.style.position = "absolute";
    channelLabel.style.left = "10px";
    channelRow.appendChild(channelLabel);

    channelContents.forEach((content, index) => {
      const node = document.createElement("div");
      node.className = "content";
      node.textContent = content.title || content.content;
      node.style.position = "absolute";
      node.style.left = `${150 + index * 200}px`;
      channelRow.appendChild(node);
    });

    container.appendChild(channelRow);
    currentTop += 150;
  });
};
