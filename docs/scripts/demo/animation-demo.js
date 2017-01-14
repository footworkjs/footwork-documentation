fw.components.register('animation-demo', {
  viewModel: function() {
    var self = this;
    this.animations = [
      'fadeIn',
      'fadeInDown',
      'fadeInDownBig',
      'fadeInLeft',
      'fadeInLeftBig',
      'fadeInRight',
      'fadeInRightBig',
      'fadeInUp',
      'fadeInUpBig',
      'flipInX',
      'flipInY',
      'lightSpeedIn',
      'rotateIn',
      'rotateInDownLeft',
      'rotateInDownRight',
      'rotateInUpLeft',
      'rotateInUpRight',
      'rollIn',
      'zoomIn',
      'zoomInDown',
      'zoomInLeft',
      'zoomInRight',
      'zoomInUp',
      'slideInDown',
      'slideInLeft',
      'slideInRight',
      'slideInUp'
    ];
    this.selectedAnimation = fw.observable();
    this.showAnimation = fw.observable(false);

    function showAnimation() {
      self.showAnimation(false);
      setTimeout(function() {
        self.showAnimation(true);
      }, 20);
    }

    this.selectedAnimation.subscribe(showAnimation);
    this.showAgain = showAnimation;

    this.selectedAnimation('rollIn');
  },
  template: '<select data-bind="options: animations, value: selectedAnimation"></select>'
          + '<button data-bind="click: showAgain">Show Again</button>'
          + '<div class="animation-demo fw-entity" data-bind="css: { \'animateIn\': showAnimation }">'
          + '  <div data-bind="css: selectedAnimation">This is animated:<span data-bind="text: selectedAnimation"></span></div>'
          + '</div>'
});
