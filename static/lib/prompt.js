;(function($) {

$.prompt = function(title, placeholder, callback) {
  $.prompt.hide();
  title = title || '';
  placeholder = placeholder || '';
  callback = callback || $.noop;
  var temp = [
    '<div class="ui-modal ui-prompt">',
      '<div class="box">',
        '<div class="close">×</div>',
        '<div class="hd">',
          title,
        '</div>',
        '<div class="bd">',
          '<input type="text" placeholder="' + placeholder + '" autofocus="autofocus" />',
        '</div>',
        '<div class="ft">',
          '<span class="ui-modal-btn primary">确定</span>',
          '<span class="ui-modal-btn primary">取消</span>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  $(temp).appendTo(document.body)
  .click(function(e) {
    e.target == this && $.prompt.hide();
  })
  .find('.ft span').click(function() {
    if($(this).index() == 0) {
      callback();
    }else {
      $.prompt.hide();
    }
  })
  .end().find('.close').click($.prompt.hide);
};
$.prompt.hide = function() {
  $('.ui-prompt').remove();
};

})(jQuery);