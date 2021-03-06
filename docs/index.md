<center>[![FootworkJS](/images/footwork.svg)](http://footworkjs.com/)</center>

Footwork is a frontend javascript framework based on [KnockoutJS](http://knockoutjs.com/) that aims to be fully featured, expressive, and easy to use while remaining as idiomatic and compatible with Knockout and its existing code base as possible.

It has features such as:

* Custom elements/components and declarative view models
* Automatic resolution and binding of declarative resources
* Page routing with unlimited outlet support
* Transition effect and animation system including sequenced animations
* Does not require a build system or module loader (but it works great with them)
* Inter-module communication and state sharing
* Much, much more...

[http://footworkjs.com/](http://footworkjs.com/ "Main Website")

Ready? Jump into the [Getting Started](getting-started.md) section!

## Build information

This verision of Footwork (<version-display params="lib: 'footwork'"></version-display>) was created with:

* [KnockoutJS](http://knockoutjs.com/) <version-display params="lib: 'knockout'"></version-display>
* [Lodash](https://lodash.com/) <version-display params="lib: 'lodash'"></version-display> (custom build)

## Issues

Please keep the [issue tracker](http://github.com/footworkjs/footwork/issues) limited to **bug reports**, **feature requests** and **pull requests**. If you are reporting a bug make sure to include information about which browser and operating system you are using as well as the necessary steps to reproduce the issue.

If applicable, providing an example using services like [JSFiddle](http://jsfiddle.net/), [JSBin](http://jsbin.com/), or [Tinkerbin](http://tinkerbin.com/) (etc) would help a lot as well.

## Contributing

Contributions are encouraged, please feel free to fork the repository and begin making changes.

### General Flow

1. **Fork** the repo on GitHub
1. **Clone** the project to your own machine
1. **Commit** changes to your own branch
1. **Push** your work back up to your fork
1. Submit a **Pull request** to the **dev** branch so that your changes can be reviewed

### Submission Notes

* Please continue the coding style expressed in the rest of source.
* If creating a new feature, please also add the corresponding test(s) for it.
* In your pull-request, please do not include an updated `dist/` build (generated via `gulp dist`), that is a final step done prior to release.

### Website and Documentation

Contributions towards the website and/or documentation are also encouraged. There are companion repositories for both of these, please contribute to them directly:

* Website ([http://footworkjs.com](http://footworkjs.com))

    [https://github.com/footworkjs/footwork-website](https://github.com/footworkjs/footwork-website)

* Documentation ([http://docs.footworkjs.com](http://docs.footworkjs.com))

    [https://github.com/footworkjs/footwork-documentation](https://github.com/footworkjs/footwork-documentation)

## Building From Source

1. **Clone the repo from GitHub:**

    ```bash
    git clone https://github.com/footworkjs/footwork.git
    cd footwork
    ```

1. **Install Node.js and NPM (if needed):**

    This is platform specific. Your OS may already include it, however if not please see: [Installing Node](https://docs.npmjs.com/getting-started/installing-node).

1. **Install [gulp](http://gulpjs.com/) globally (if needed):**

    ```bash
    sudo npm install -g gulp-cli
    ```

1. **Acquire build dependencies:**

    ```bash
    npm install
    ```

1. **Run a gulp task to build/test/etc:**

    * Build everything (output in /build):

        ```bash
        gulp
        ```

    * You can include the `---debug` option on any of the build/testing tasks to include/generate a source map in the output:

        ```bash
        gulp --debug
        ```

    * Build everything and run tests (coverage report output in build/coverage-reports):

        ```bash
        gulp tests
        ```

    * Watch for changes in the source code and automatically rebuild:

        ```bash
        gulp watch
        ```

    * Watch for changes in the source code/tests and automatically rebuild + run tests:

        ```bash
        gulp watch-test
        ```

    * Build everything, minify, and deploy to /dist (for release):

        ```bash
        gulp dist
        ```

    * To debug the tests in your own browser:

        * Make sure your build is made *without* being instrumented for test coverage by running the default build task (otherwise debugging might be a bit difficult):

            ```bash
            gulp
            ```

        * Install karma (if needed)

            ```bash
            sudo npm install -g karma-cli
            ```

        * Start karma and then you can access/debug the tests from your browser at: [http://localhost:9876/debug.html](http://localhost:9876/debug.html)

            ```bash
            karma start
            ```

## License

MIT license - [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)
