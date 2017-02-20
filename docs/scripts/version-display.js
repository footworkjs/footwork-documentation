fw.components.register('version-display', {
  viewModel: function(params) {
    this.version = 'v' + fw.version[params.lib];
  },
  template: '<span class="lib-version" data-bind="text: version"></span>'
});
