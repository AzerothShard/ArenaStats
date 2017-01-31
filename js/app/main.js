/*jslint browser: true, white: true, plusplus: true, eqeq: true*/
/*global angular, console, alert*/

(function () {
  'use strict';
  var app = angular.module('arenastats', ['ui.router', 'ui.bootstrap', 'chieffancypants.loadingBar', 'tableSort']);

  app.filter('range', function() {
    return function(input, total) {
      total = parseInt(total);

      for (var i=0; i<total; i++)
        input.push(i);

      return input;
    };
  });


  app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
      url: '/',
      controller: 'MainController',
      templateUrl: 'partials/main.html'
    })
      .state('team', {
      url: '/team/:id',
      controller: 'TeamDetailsController',
      templateUrl: 'partials/team-details.html'
    });
  });

  app.controller("GlobalController", function($rootScope, $scope, $http, $state) {

    $scope.serverName = app.serverName;
    $scope.apiLoaded = true;

    $http.get( app.api + "search/worldstates?comment=NextArenaPointDistributionTime" )
      .success(function(data, status, header, config) {
      if (data.length == 1) {
        $scope.NextArenaPointDistributionTime = data[0].value;
        console.log("[INFO] Loaded NextArenaPointDistributionTime");
      } else {
        console.log("[ERROR] Problems while retrieving NextArenaPointDistributionTime");
      }
    })
      .error(function(data, status, header, config) {
      console.log("Error in ArenaStats $http.get: " + app.api + "search/worldstates?comment=NextArenaPointDistributionTime");
      $scope.apiLoaded = false;
    });

    $rootScope.season = "";
    $scope.numSeasons = [];

    $scope.setSeason = function(season) {
      $rootScope.season = season;
    };

    /* get count of seasons */
    $http.get( app.api + "get_tournament_seasons" )
      .success(function(data, status, header, config) {
      if (data.length == 1)
        $scope.numSeasons = data[0].count;
      else
        console.log("[ERROR] Problems while retrieving number of the tournament seasons");
    })
      .error(function(data, status, header, config) {
      console.log("Error in ArenaStats $http.get: " + app.api + "get_tournament_seasons");
    });

  });

  app.controller("MainController", function($rootScope, $scope, $http, $state) {

    /* onchange $rootScope.season reload statistics */
    $scope.$watch(function() {
      return $rootScope.season;
    }, function() {
      $scope.loadSeason();
    }, true);

    var processTeams = function (teams) {
      if (!teams) { return; }

      teams.forEach(function(team) {

        if (team.rank == 0) {
          team.rank = 9999; // we need to put teams with rank 0 at bottom
        }

        switch (parseInt(team.captainRace, 10)) {
          case 2:
          case 5:
          case 6:
          case 8:
          case 9:
          case 10:
            team.faction = "horde";
            break;

          case 1:
          case 3:
          case 4:
          case 7:
          case 11:
            team.faction = "alliance";
            break;
        }

      });
    };

    $scope.loadSeason = function() {

      //[AZTH] 1v1
      $http.get( app.api + "arena_team/type/1?season=" + $rootScope.season )
        .success(function(data, status, header, config) {
        $scope.teams1 = data;
        processTeams($scope.teams1);
        console.log("[INFO] Loaded 1v1 teams");
      })
        .error(function(data, status, header, config) {
        console.log("Error in ArenaStats $http.get: " + app.api + "arena_team/type/1");
        $scope.apiLoaded = false;
      });

      $http.get( app.api + "arena_team/type/2?season=" + $rootScope.season )
        .success(function(data, status, header, config) {
        $scope.teams2 = data;
        processTeams($scope.teams2);
        console.log("[INFO] Loaded 2v2 teams");
      })
        .error(function(data, status, header, config) {
        console.log("Error in ArenaStats $http.get: " + app.api + "arena_team/type/2");
        $scope.apiLoaded = false;
      });

      $http.get( app.api + "arena_team/type/3?season=" + $rootScope.season )
        .success(function(data, status, header, config) {
        $scope.teams3 = data;
        processTeams($scope.teams3);
        console.log("[INFO] Loaded 3v3 teams");
      })
        .error(function(data, status, header, config) {
        console.log("Error in ArenaStats $http.get: " + app.api + "arena_team/type/3");
        $scope.apiLoaded = false;
      });

      //[AZTH] 3v3 SoloQ
      $http.get( app.api + "arena_team/type/4?season=" + $rootScope.season )
        .success(function(data, status, header, config) {
        $scope.teams4 = data;
        processTeams($scope.teams4);
        console.log("[INFO] Loaded 3v3 SoloQ teams");
      })
        .error(function(data, status, header, config) {
        console.log("Error in ArenaStats $http.get: " + app.api + "arena_team/type/4");
        $scope.apiLoaded = false;
      });


      $http.get( app.api + "arena_team/type/5?season=" + $rootScope.season )
        .success(function(data, status, header, config) {
        $scope.teams5 = data;
        processTeams($scope.teams5);
        console.log("[INFO] Loaded 5v5 teams");
      })
        .error(function(data, status, header, config) {
        console.log("Error in ArenaStats $http.get: " + app.api + "arena_team/type/5");
        $scope.apiLoaded = false;
      });

    };

    $scope.showTeam = function(id) {
      $state.go('team', {id: id});
    };

  });

}());
