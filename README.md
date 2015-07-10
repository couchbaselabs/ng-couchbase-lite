# ng-couchbase-lite

This is an AngularJS wrapper to be used with the Couchbase Lite RESTful APIs.  It makes it so you don't have to do all the requests manually, but instead can call simple commands.

## Installation

Include the repositories **dist/ng-couchbase-lite.min.js** file into your mobile hybrid application's project directory.  With the file in place, include the script in your HTML file, typically **index.html**.  Finally inject the library into your AngularJS `angular.module` in a similar fashion to the following:

```
angular.module("modulename", ["ngCouchbaseLite"])
```

## Usage

To use, inject `$couchbase` into your controller dependencies and call the constructor method:

```
var database = new $couchbase(databaseUrl, databaseName);
```

Note that the databaseUrl is the URL that is returned when using the `cblite.getURL` method that ships with the Apache Cordova Couchbase plugin.

### Available Commands

```
promise database.createDatabase();
promise database.createDesignDocument(string designDocumentName, object designDocumentViews);
promise database.createDocument(object json);
promise database.getDesignDocument(string designDocumentName);
promise database.queryView(string designDocumentName, string viewName);
promise database.deleteDocument(string documentId, string documentRevision);
promise database.getAllDocuments();
promise database.getDocument();
promise database.replicate(string source, string target, boolean continuous);
void    database.listen();
```

## Need Help?

Visit the [Couchbase Forums](https://forums.couchbase.com/) and open a ticket under the mobile section.

## Resources

Couchbase Lite REST API - [http://developer.couchbase.com/mobile/develop/references/couchbase-lite/rest-api/index.html](http://developer.couchbase.com/mobile/develop/references/couchbase-lite/rest-api/index.html)
