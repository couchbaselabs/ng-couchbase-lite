/*
 * This AngularJS factory is just a wrapper for all the RESTful API requests that
 * come packaged with the Couchbase Lite SDK.
 *
 * URL: http://developer.couchbase.com/mobile/develop/references/couchbase-lite/rest-api/index.html
 */
angular.module("ngCouchbaseLite", []).factory("$couchbase", ["$q", "$http", "$rootScope", function($q, $http, $rootScope) {

    this.databaseUrl = null;
    this.databaseName = null;

    /*
     * Construct a new Couchbase object given a database URL and database name
     *
     * @param    string databaseUrl
     * @param    string databaseName
     * @return   promise
     */
    var couchbase = function(databaseUrl, databaseName) {
        this.databaseUrl = databaseUrl;
        this.databaseName = databaseName;
    };

    couchbase.prototype = {
		
	/*
         * returns the database url
         *
         * @param
         * @return  string
         */
        getUrl: function() {
            return this.databaseUrl;
        },
		
        /*
         * Create a new database with a name that was passed in from the constructor method
         *
         * @param
         * @return   promise
         */
        createDatabase: function() {
            return this.makeRequest("PUT", this.databaseUrl + this.databaseName);
        },

        /*
         * Get a database from the name that was passed in from the constructor method
         *
         * @param
         * @return   promise
         */
        getDatabase: function() {
            return this.makeRequest("GET", this.databaseUrl + this.databaseName);
        },

        /*
         * Create a new design document with views
         *
         * @param    string designDocumentName
         * @param    object designDocumentViews
         * @return   promise
         */
        createDesignDocument: function(designDocumentName, designDocumentViews) {
            var data = {
                views: designDocumentViews
            };
            var designPrefix = "";
            if(designDocumentName.indexOf("_design/") === -1){
            	designPrefix = "_design/";
            }
            return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + designPrefix + designDocumentName, {}, data);
        },

        /*
         * Get a design document and all views associated to insert
         *
         * @param    string designDocumentName
         * @return   promise
         */
        getDesignDocument: function(designDocumentName) {
            var designPrefix = "";
            if(designDocumentName.indexOf("_design/") === -1){
            	designPrefix = "_design/";
            }
            return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designPrefix + designDocumentName);
        },

        /*
         * Query a particular database view
         *
         * @param    string designDocumentName
         * @param    string viewName
         * @param    object options
         * @return   promise
         */
        queryView: function(designDocumentName, viewName, options) {
            return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designDocumentName + "/_view/" + viewName, options);
        },

        /*
         * Create a new database document
         *
         * @param    object jsonDocument
         * @return   promise
         */
        createDocument: function(jsonDocument) { 
            return this.makeRequest("POST", this.databaseUrl + this.databaseName, {}, jsonDocument);
        },
        
        /*
         * Create a new database local document
         *
         * @param    string id or empty string for auto generated id, object jsonDocument
         * @return   promise
         */
        createLocalDocument: function(id,jsonDocument) {
            return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/_local/" + id, {}, jsonDocument);
        },

        /*
         * Update a particular document based on its id and revision
         *
         * @param    string documentId
         * @param    string documentRevision
         * @param    object jsonDocument
         * @return   promise
         */
        updateDocument: function(documentId, documentRevision, jsonDocument) {
            return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision}, jsonDocument);
        },

        /*
         * Delete a particular document based on its id and revision
         *
         * @param    string documentId
         * @param    string documentRevision
         * @return   promise
         */
        deleteDocument: function(documentId, documentRevision) {
            return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision});
        },

        /*
         * Get all documents from the database
         *
         * @param
         * @return   promise
         */
        getAllDocuments: function() {
            return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs");
        },

        /*
         * Get a document from the database
         *
         * @param    string documentId
         * @return   promise
         */
        getDocument: function(documentId) {
            return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + documentId);
        },
        
        /*
         * Get a local document from the database
         *
         * @param    string documentId
         * @return   promise
         */
        getLocalDocument: function(documentId) {
            return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_local/" + documentId);
        },

        /*
         * Replicate in a single direction whether that be local to remote or remote to local
         *
         * @param    string source
         * @param    string target
         * @param    boolean continuous
         * @return   promise
         */
        replicate: function(source, target, continuous) {
            return this.makeRequest("POST", this.databaseUrl + "_replicate", {}, {source: source, target: target, continuous: continuous});
        },

        /*
         * Continually poll the database for changes that include replications from a remote source
         *
         * @param
         * @return
         */
        listen: function() {
            var poller = function(databaseUrl, databaseName, cseq) {
                $http({method: "GET", url: databaseUrl + databaseName + "/_changes", params: {feed: "longpoll", since: cseq}, withCredentials: true}).then(function(result) {
                    $rootScope.$broadcast("couchbase:change", result.data);
                    setTimeout(function() {
                        poller(databaseUrl, databaseName, result.data.last_seq);
                    }, 10);
                }, function(error) {
                    console.log("POLLING ERROR -> " + JSON.stringify(error));
                });
            };
            poller(this.databaseUrl, this.databaseName, 0);
        },
        
        /*
         * retrieve a list of all tasks running on the server
         *
         * @param
         * @return promise
         */
        getActiveTasks: function () {   
		return this.makeRequest("GET", this.databaseUrl + "_active_tasks");
	},

	/*
         * Make a RESTful request to an endpoint while providing parameters or data or both
         *
         * @param    string method
         * @param    string url
         * @param    object params
         * @param    object data
	 * @param    boolean complete 
         * @return   promise
         */
	makeRequest: function(method, url, params, data,complete) {
		var deferred = $q.defer();
		var settings = {
			method: method,
			url: url,
			withCredentials: true
		};
		if(params) {
			settings.params = params;
		}
		if(data) {
			settings.data = data;
		}
		if(complete){
			return $http(settings);
		}
		$http(settings)
			.success(function(result) {
			deferred.resolve(result);
		})
			.error(function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
	}

    };

    return couchbase;

}]);
