$(document).ready(function () {
  $(".menu").draggable();

  function makeDraggable(el) {
    $(el).draggable();
  }

  $(".channel-content").each(function () {
    makeDraggable(this);
  });

  window.makeDraggable = makeDraggable;
});
