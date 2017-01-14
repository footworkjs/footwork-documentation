define(['footwork'],
  function(fw) {
    function LikeWidgetViewModel(params) {
      this.chosenValue = params.value;
    }

    LikeWidgetViewModel.prototype.like = function() {
      this.chosenValue('like');
    };

    LikeWidgetViewModel.prototype.dislike = function() {
      this.chosenValue('dislike');
    };

    return LikeWidgetViewModel;
  }
);
