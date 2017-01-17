;(function($) {

$.confirm = function(text, title, callback) {
  $.confirm.hide();
  var options = {
    text: text,
    title: 'neirong.lianjia.com显示',
  };
  if($.isFunction(title)) {
    options.callback = title;
  }else {
    options.title = title || 'neirong.lianjia.com显示';
    options.callback = callback || $.noop;
  }
  var temp = [
    '<div class="ui-modal ui-confirm">',
      '<div class="box">',
        '<div class="close">×</div>',
        '<div class="hd">',
          options.title,
        '</div>',
        '<div class="bd">',
          options.text,
        '</div>',
        '<div class="ft">',
          '<span>确定</span>',
          '<span>取消</span>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  $(temp).appendTo(document.body)
  .click(function(e) {
    e.target == this && $.confirm.hide();
  })
  .find('.ft span').click(function() {
    if($(this).index() == 0){
      options.callback();
    }else{
      $.confirm.hide();
    }
  })
  .end().find('.close').click($.confirm.hide);
};
$.confirm.hide = function() {
  $('.ui-confirm').remove();
};

})(jQuery);