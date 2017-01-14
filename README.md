![footwork.js](https://raw.github.com/footworkjs/footwork/master/dist/gh-footwork-logo.png)

This repository contains the documentation for the frontend javascript framework [Footwork](https://github.com/footworkjs/footwork).

For more details, [see the main website](http://footworkjs.com/ "http://footworkjs.com").

[![Join the chat at https://gitter.im/footworkjs/footwork](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/footworkjs/footwork?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### Using this documentation

This documentation is based on [MkDocs](http://www.mkdocs.org/), a markdown based documentation generator.

1. **Clone the repo from GitHub:**

        git clone https://github.com/footworkjs/footwork-documentation.git
        cd footwork-documentation

1. **Install Python PIP and mkdocs:**

  You will need to use python pip ([pip installation](https://pip.pypa.io/en/stable/installing/)) to install MkDocs ([http://www.mkdocs.org/#installation](http://www.mkdocs.org/#installation)) and its related material theme.

  * Install python pip (Ubuntu shown, see [pip installation](https://pip.pypa.io/en/stable/installing/) for more/other info):

          sudo apt-get install python-pip

  * Install mkdocs:

          pip install mkdocs

  * Install and build the footwork-mkdocs-material theme:

      Note that this will need to be installed at the same level directory as the main documentation folder (this folder is pointed at from mkdocs.yml via the theme_dir option if you want it in a different place):

          git clone https://github.com/footworkjs/footwork-mkdocs-material.git -b footwork
          cd footwork-mkdocs-material
          pip install pymdown-extensions
          npm install
          gulp

1. **Install Node.js (if needed):**

  This is platform specific. Your OS may already include it, however if not please see: [Installing Node](https://docs.npmjs.com/getting-started/installing-node).

1. **Install gulp and bower globally (if needed):**

  * gulp
  
          sudo npm install -g gulp-cli

  * bower
  
          sudo npm install -g bower

1. **Install local npm and bower based dependencies:**

        npm install && bower install

1. **Build or run the site:**

  Note that you will need to run the default ```gulp``` task to build the initial CSS assets, then you can use the *watch* task afterwards. 

  * Build the site and its assets, generated output in ```/site```

          gulp

  * Run watch process which rebuilds css/html and auto-refreshes your browser when pointed at: http://localhost:8000

          # Local access via: http://localhost:8000
          gulp watch

    ...you can also run it on a different port like this:

        # Local access via: http://localhost:9000
        gulp watch --port 9000

### Archive and Deployment Release Notes

A quick copy/paste for building a release and (tar.gz) archive it:

    # Run from root of this repo
    VERSION=2.0.0 && gulp && tar czf footwork-docs-${VERSION}.tar.gz --transform "s,^,footwork-docs-${VERSION}/,"  -C ./site ./

And then to extract, link, and make zip in production environment:

    # Upload the above archive to footwork-documentation-site/public/release and run this command from it:
    VERSION=2.0.0 && tar -zxf footwork-docs-${VERSION}.tar.gz && rm -f ${VERSION} && ln -s footwork-docs-${VERSION} ${VERSION} && zip -r footwork-docs-${VERSION}.zip footwork-docs-${VERSION}

### License

MIT license - [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)

[![Analytics](https://ga-beacon.appspot.com/UA-52543452-1/footwork/GITHUB-ROOT)](https://github.com/reflectiveSingleton/ga-beacon)
