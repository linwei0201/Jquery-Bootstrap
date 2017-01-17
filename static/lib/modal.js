;(function($) {

$.modal = function(options) {
  $.modal.hide();
  var defaults = {
    text: '',
    title: 'neirong.lianjia.com显示',
    className: '',
    btns: ['取消', '确定'],
    callback: $.noop
  };
  var settings = $.extend({}, defaults, options);
  var temp = [
    '<div class="ui-modal ui-dialog ' + settings.className + '">',
      '<div class="box">',
        '<div class="close">×</div>',
        '<div class="hd">',
          settings.title,
        '</div>',
        '<div class="bd">',
          settings.text,
        '</div>',
        '<div class="ft">',
          settings.btns.map(function(v, i) {return '<span>' + settings.btns[i] + '</span>'}).join(''),
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  $(temp).appendTo(document.body)
  .click(function(e) {
    e.target == this && $.modal.hide();
  })
  .find('.ft span').click(function() {
    var index = $(this).index();
    index === 0 ? $.modal.hide() : settings.callback(index);
  })
  .end().find('.close').click($.modal.hide);
};
$.modal.hide = function() {
  $('.ui-dialog').remove();
}

})(jQuery);