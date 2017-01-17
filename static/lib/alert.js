;(function($) {

$.alert = function(text, title, btn, callback) {
  $.alert.hide();
  var options = {
    text: text,
    title: 'neirong.lianjia.com显示',
    btn: '确定'
  };
  if($.isFunction(title)) {
    options.callback = title;
  }else if($.isFunction(btn)){
    options.callback = btn;
    options.title = title || 'neirong.lianjia.com显示';
  }else {
    options.callback = callback || $.noop;
    options.title = title || 'neirong.lianjia.com显示';
    options.btn = btn || '确定';
  }
  var temp = [
    '<div class="ui-modal ui-alert">',
      '<div class="box">',
        '<div class="close">×</div>',
        '<div class="hd">',
          options.title,
        '</div>',
        '<div class="bd">',
          options.text,
        '</div>',
        '<div class="ft">',
          '<span>',
            options.btn,
          '</span>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  $(temp).appendTo(document.body)
  .click(function(e) {
    e.target == this && $.alert.hide();
  })
  .find('.ft span').click(function() {
    $.alert.hide();
    options.callback();
  })
  .end().find('.close').click($.alert.hide);
};
$.alert.hide = function() {
  $('.ui-alert').remove();
}

})(jQuery);