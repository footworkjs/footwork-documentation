fw.components.register('person', {
  viewModel: function(params) {
    var self = fw.viewModel.boot(this, {
      namespace: 'person',
      sequence: 70
    });
    self.name = params.name;
  },
  template: '<div class="flipInX" data-bind="text: name"></div>'
});

fw.components.register('sequence-demo', {
  viewModel: function() {
    var self = this;
    this.peopleList = fw.observableArray();

    this.showAgain = function () {
      self.peopleList.removeAll();
      setTimeout(function() {
        self.peopleList([
          'Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5',
          'Person 6', 'Person 7', 'Person 8', 'Person 9', 'Person 10'
        ]);
      }, 20);
    };

    this.showAgain();
  },
  template: '<button data-bind="click: showAgain">Show List</button>'
          + '<div class="list" data-bind="foreach: peopleList">'
          + '  <person params="name: $data"></person>'
          + '</div>'
});
