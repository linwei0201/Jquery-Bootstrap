(function($) {

$.toast = function(text, stillShow) {
  $.toast.hide();
  var temp = [
    '<div class="ui-toast">',
      '<div class="box">',
        stillShow && '<div class="icon-loading"></div>',
        '<div>',
          text,
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  $(temp).appendTo(document.body);
  !stillShow && setTimeout($.toast.hide, 2e3);
};
$.toast.hide = function() {
  $('.ui-toast').remove();
};

})(jQuery);