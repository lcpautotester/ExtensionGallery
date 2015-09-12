var galleryApp=angular.module("galleryApp",["ngRoute"]).filter("escape",function(){return window.encodeURIComponent}).config(["$routeProvider","$locationProvider",function(a,b){b.html5Mode(!0),a.when("/",{title:"Visual Studio Extension Gallery",controller:"homeController",templateUrl:"app/views/home.html"}).when("/author/:name",{controller:"authorController",templateUrl:"app/views/home.html"}).when("/extension/:id/",{controller:"extensionController",templateUrl:"app/views/extension.html"}).when("/upload",{controller:"uploadController",templateUrl:"app/views/upload.html"}).when("/guide/dev/",{controller:"devguideController",templateUrl:"app/views/devguide.html"}).when("/guide/feed/",{controller:"feedguideController",templateUrl:"app/views/feedguide.html"}).otherwise({redirectTo:"/"})}]),constants={DEFAULT_ICON_IMAGE:"/img/default-icon.png",DEFAULT_PREVIEW_IMAGE:"/img/default-preview.png"};galleryApp.service("dataService",["$http",function(a){function b(a){return a.DownloadUrl=d+a.ID+"/"+encodeURIComponent(a.Name+" v"+a.Version)+".vsix",a.Icon?a.Icon=d+a.ID+"/"+a.Icon:a.Icon=constants.DEFAULT_ICON_IMAGE,a.Preview?a.Preview=d+a.ID+"/"+a.Preview:a.Preview=constants.DEFAULT_PREVIEW_IMAGE,a.SupportedVersions=a.SupportedVersions.map(function(a){return 0==a.indexOf("11.")?2012:0==a.indexOf("12.")?2013:0==a.indexOf("14.")?2015:void 0}),a.relativeDate=moment(a.DatePublished).fromNow(),a}var c="/api/",d="/extensions/",e=[];this.getAllExtensions=function(d){return e.length>0?d(e):void a.get(c+"get/").success(function(a){for(var c=0;c<a.length;c++)b(a[c]);e=a,d(a)}).error(function(a){d({error:!0})})},this.getExtension=function(d,f){var g=e.filter(function(a){return a.ID===d});return g.length>0?f(g[0]):void a.get(c+"get/"+d).success(function(a){f(b(a))})},this.upload=function(d,f,g){a.post(c+"upload"+f,new Blob([d],{})).success(function(a){for(var c=0;c<e.length;c++){var d=e[c];if(d.ID==a.ID){e.splice(c,1);break}}e.splice(0,0,b(a)),g(a)}).error(function(a){g({error:!0})})}}]),galleryApp.controller("homeController",["$scope","$rootScope","dataService",function(a,b,c){b.pageTitle="Open VSIX Gallery",a.feed="/feed/",a.query="",a.packageSearch=function(b){var c=a.query.toUpperCase();return-1!=b.Name.toUpperCase().indexOf(c)||-1!=b.Description.toUpperCase().indexOf(c)||-1!=b.Author.toUpperCase().indexOf(c)||b.Tags&&-1!=b.Tags.toUpperCase().indexOf(c)},c.getAllExtensions(function(b){a.packages=b})}]),galleryApp.controller("extensionController",["$scope","$rootScope","$location","$route","dataService",function(a,b,c,d,e){var f=d.current.params.id;e.getExtension(f,function(d){d.error&&c.path("/"),b.pageTitle=d.Name,a["package"]=d}),window.scrollTo(0,0)}]),galleryApp.controller("uploadController",["$scope","$rootScope","$location","dataService",function(a,b,c,d){b.pageTitle="Upload an extension",a.error="",a.repo="",a.issuetracker="",localStorage&&(a.repo=localStorage["upload.repo"],a.issuetracker=localStorage["upload.issuetracker"]),a.upload=function(){var b=document.getElementById("uploadfile"),e=new FileReader;e.onload=function(b){var e="?repo="+encodeURIComponent(a.repo)+"&issuetracker="+encodeURIComponent(a.issuetracker);d.upload(b.target.result,e,function(b){b.error?a.error=b:c.path("/extension/"+b.ID)})},e.readAsArrayBuffer(b.files[0]),localStorage&&localStorage["upload.repo"]&&(localStorage["upload.repo"]=a.repo),localStorage&&localStorage["upload.issuetracker"]&&(localStorage["upload.issuetracker"]=a.issuetracker)}}]),angular.module("galleryApp").run(["$templateCache",function(a){"use strict";a.put("app/views/devguide.html",'<h1 class=page-header>Add your extension</h1><p>You can add your extension to this gallery in 2 different ways as part of your build automation.</p><ol><li>Use PowerShell</li><li>Use <a href=http://appveyor.com>AppVeyor</a></li></ol><p>Both PowerShell and AppVeyor uses a <a href=https://github.com/madskristensen/ExtensionScripts/blob/master/AppVeyor/vsix.ps1>custom script</a> that makes it easy to publish the extension to this gallery. It contains other functions that are useful for incrementing the VSIX version and other handy things.</p><section><h2>Use PowerShell</h2><p>First you must execute the VSIX script</p><pre>(new-object Net.WebClient).DownloadString("https://raw.github.com/madskristensen/ExtensionScripts/master/AppVeyor/vsix.ps1") | iex</pre><p>That allows you to call methods upload the .vsix extension file to the gallery.</p><pre>Vsix-PublishToGallery</pre><p>That will find all .vsix files in the working directory recursively and upload them. To specify the path, simply pass it in as the first parameter:</p><pre>Vsix-PublishToGallery .\\src\\WebCompilerVsix\\**\\*.vsix</pre></section><section><h2>Use AppVeyor</h2><p>AppVeyor is a build server hosted in the cloud and it\'s free.</p><p>After you\'ve created an account, you can start doing automated builds. A really nice thing is that AppVeyor can automatically kick off a new build when you commit code to either GitHub, VSO or other code repositories.</p><p>To automatically upload your extension to vsixgallery.com when the build has succeeded, all you have to do is to add an <strong>appveyor.yml</strong> file to the root of your repository. The content of the file should look like this:</p><pre>\r\nversion: 1.0.{build}\r\ninstall:\r\n  - ps: (new-object Net.WebClient).DownloadString("https://raw.github.com/madskristensen/ExtensionScripts/master/AppVeyor/vsix.ps1") | iex\r\nbefore_build:\r\n  - ps: Vsix-IncrementVsixVersion | Vsix-UpdateBuildVersion\r\nbuild_script:\r\n  - msbuild /p:configuration=Release /p:DeployExtension=false /p:ZipPackageCompressionLevel=normal /v:m\r\nafter_test:\r\n  - ps: Vsix-PushArtifacts | Vsix-PublishToGallery\r\n</pre><p>You might want to check out these real-world uses:</p><ul><li><a href=https://github.com/madskristensen/WebEssentials2015/blob/master/appveyor.yml>Web Essentials 2015</a></li><li><a href=https://github.com/jaredpar/VsVim/blob/master/appveyor.yml>VsVim</a></li><li><a href=https://github.com/madskristensen/WebCompiler/blob/master/appveyor.yml>Web Compiler</a></li><li><a href=https://github.com/madskristensen/AddAnyFile/blob/master/appveyor.yml>Add New File</a></li></ul></section>'),a.put("app/views/extension.html",'<div id=extensions><div data-ng-model=package data-ng-show=package><h1 class=page-header>{{package.Name}}</h1><article class=extension><img class=preview data-ng-src={{package.Preview}} alt="{{package.Name}}"><div class=properties><div class=details><p>{{package.Description}}</p><p><strong>Author:</strong> <a data-ng-href="/author/{{package.Author | lowercase | escape }}">{{package.Author}}</a></p><!--<p><strong>Supports:</strong> <span data-ng-repeat="version in package.SupportedVersions">{{version + \'&nbsp;\'}}</span></p>--><p data-ng-show=package.Tags><strong>Tags:</strong> {{package.Tags}}</p><p><strong>Version:</strong> {{package.Version}}</p><p><strong>Updated:</strong> <time datetime="{{package.DatePublished | date:\'yyyy-MM-dd\'}}">{{package.DatePublished | date:\'MMM d. yyyy HH:mm\'}}</time></p></div><ul><li data-ng-show=package.MoreInfoUrl><a href={{package.MoreInfoUrl}}><span class="glyphicon glyphicon-home" aria-hidden=true></span> Website</a></li><li data-ng-show=package.Repo><a href={{package.Repo}}><span class="glyphicon glyphicon-pencil" aria-hidden=true></span> Source code</a></li><li data-ng-show=package.IssueTracker><a href={{package.IssueTracker}}><span class="glyphicon glyphicon-ok" aria-hidden=true></span> Issue Tracker</a></li></ul><br><a class="btn btn-success" href={{package.DownloadUrl}} target=_self><span class="glyphicon glyphicon-cloud-download" aria-hidden=true></span> Download</a> <a class="btn btn-default" href=/feed/extension/{{package.ID}} target=_self><span class="glyphicon glyphicon-cog" aria-hidden=true></span> Feed</a></div></article><br><div data-ng-show=package.License class=clearfix><h2>License</h2><pre>{{package.License}}</pre></div></div></div>'),a.put("app/views/feedguide.html",'<h1 class=page-header>Subscribe to feed</h1><p>Visual Studio is capable of subscribing to extension feeds, so you will be notified of any updates to extensions found in this gallery. You will only be notified of any updates to extensions that you already have installed.</p><section><h2>Choose the right feed</h2><p>There are several feeds in this gallery you can subscribe to.</p><dl><dt>The main feed</dt><dd>By subscribing to the <a href="/feed/" target=_self>main feed</a> you will be notified by Visual Studio whenever any of the extensions in this gallery are updated. The feed contains all extensions available.</dd><dt>Feed per author</dt><dd>Each extension author has their own feed, so you can choose to subsribe to one or more authors\' extensions.</dd><dt>Feed for individual extension</dt><dd>If you\'re only interested in getting updates to specific extensions, then you can subsribe to feeds for that one extension.</dd></dl></section><section><h2>Setup</h2><p>In Visual Studio go to <strong>Tools -> Options -> Environment -> Extensions and Updates</strong>.</p><p><img src=/img/visual-studio-options-dialog.png alt="Visual Studio options dialog"></p><p>Click the <strong>Add</strong> button and fill in the name and URL fields.</p><p><strong>Name</strong>: Give it a name you like</p><p><strong>URL</strong>: Could be the main feed <a href="/feed/" target=_self>http://vsixgallery.com/feed/</a></p><p>And finally click the <strong>Apply</strong> button.</p><p>That\'s it. You\'ve now added the nightly feed to Visual Studio and updates will start to show up in <strong>Tools -> Extensions and Updates</strong> dialog</p><br><h3>Extensions and Updates</h3><p>You can now see the updates coming in to the <strong>Tools -> Extensions and Updates</strong> dialog.</p><p><img src=/img/visual-studio-extensions-updates.png alt="Visual Studio Extensions and Updates"></p></section>'),a.put("app/views/home.html",'<h1 class=page-header>{{pageTitle}} <a href={{feed}} class="btn btn-default" target=_self><span class="glyphicon glyphicon-cog" aria-hidden=true></span> Feed</a></h1><div id=extensions><div id=searchform class=form-group><label class=sr-only for=search>Search</label><div class=input-group><div class=input-group-addon><span class="glyphicon glyphicon-search"></span></div><input type=text id=search data-ng-model=query placeholder=Search class="form-control"></div></div><article data-ng-repeat="package in packages | filter: packageSearch as results"><a class=icon href=/extension/{{package.ID}}><img width=90 data-ng-src={{package.Icon}} alt="{{package.Name}}"></a><div><h3><a data-ng-href=/extension/{{package.ID}}>{{package.Name}}</a> <span>v{{package.Version}}</span></h3><a class=author data-ng-href="/author/{{package.Author | lowercase | escape }}">{{package.Author}}</a><p>{{package.Description}}</p><a class="btn-sm btn-success" href={{package.DownloadUrl}} target=_self><span class="glyphicon glyphicon-cloud-download" aria-hidden=true></span> Download</a> <a class="btn-sm btn-default" href=/feed/extension/{{package.ID}} target=_self><span class="glyphicon glyphicon-cog" aria-hidden=true></span> Feed</a> Updated <time datetime="{{package.DatePublished | date:\'yyyy-MM-dd\'}}">{{package.relativeDate}}</time></div></article><article ng-show="results.length == 0"><h3>No extensions found</h3></article></div>'),a.put("app/views/upload.html",'<h1 class=page-header>Upload new extension</h1><p>Upload a new extension to the gallery. It can either be a brand new extension or and updated version of an extension that\'s already on the gallery.</p><form id=upload data-ng-hide=form.$submitted data-ng-submit=upload()><div class=form-group><label for=repo>Source code</label><input type=url data-ng-model=repo id=repo class=form-control placeholder="Url to the source code repository"></div><div class=form-group><label for=issuetracker>Issue tracker</label><input type=url id=issuetracker data-ng-model=issuetracker class=form-control placeholder="Url to the issue tracker"></div><div class=form-group><label for=uploadfile>Select file</label><input type=file id=uploadfile accept=.vsix required><p class=help-block>Only .vsix files are supported</p></div><input type=submit value=Upload class="btn-sm btn-primary"><p class=has-error data-ng-show="upload.url.$invalid || error">{{error}}</p></form>')}]),galleryApp.controller("authorController",["$scope","$rootScope","$route","dataService",function(a,b,c,d){function e(a){return a.replace(/\w\S*/g,function(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()})}b.pageTitle="Extensions by "+e(c.current.params.name),a.feed="/feed/author/"+c.current.params.name+"/",a.query="",a.packageSearch=function(b){var c=a.query.toUpperCase();return-1!=b.Name.toUpperCase().indexOf(c)||-1!=b.Description.toUpperCase().indexOf(c)||-1!=b.Author.toUpperCase().indexOf(c)||b.Tags&&-1!=b.Tags.toUpperCase().indexOf(c)},d.getAllExtensions(function(b){var d=c.current.params.name.toUpperCase();a.packages=b.filter(function(a){return a.Author.toUpperCase()===d})})}]),galleryApp.controller("feedguideController",["$scope","$rootScope",function(a,b){b.pageTitle="Subscribe to feed",window.scrollTo(0,0)}]),galleryApp.controller("devguideController",["$scope","$rootScope",function(a,b){b.pageTitle="Add your extension",window.scrollTo(0,0)}]),angular.bootstrap(document.querySelector("html"),["galleryApp"]);