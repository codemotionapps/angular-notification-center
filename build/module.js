/*!
 * angular-notification-center
 * https://github.com/codemotionapps/angular-notification-center
 * Version: 0.0.1 - 2016-07-15T12:59:31.822Z
 * License: GPL-3.0
 */


(function (root, factory) {
	'use strict';
	if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		if (typeof angular === 'undefined') {
			factory(require('angular'));
		} else {
			factory(angular);
		}
		module.exports = 'ngDialog';
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(['angular'], factory);
	} else {
		// Global Variables
		factory(root.angular);
	}
}(this, function (angular) {
	'use strict';
	angular.module("notificationCenter", [

	]).provider("notification", function(){
		var getDeveloperNotifications,
			loadMoreNotifications,
			seeNotifications,
			newNotification,
			showDesktopNotifications,
			permission = false,
			allNotificationsLoaded = false,
			newNotifications = false,
			notificationsOpen = false,
			noMoreNotificationsCallbacks = [],
			notifications = [],
			disabledNotifications = (localStorage.getItem('disabledNotifications') === "true"),
			desktopNotifications = (("Notification" in window) && Notification !== undefined && Notification.permission === "granted") ? true : false;
		
		var unreadNotifications = {
			value: 0,
			set: function(value){
				this.value = value;
			},
			plus1: function(){
				this.value++;
			}
		};
		
		var loading = {
			value: false,
			set: function(value){
				this.value = value;
				this.callbacks.forEach(function(callback){
					callback(value);
				});
			},
			get: function(){
				return this.value;
			},
			callbacks: [],
			addCallback: function(callback){
				this.callbacks.push(callback);
			}
		};
		
		this.loading = loading;
		
		newNotification = function(notification, scope, compile){
			var tmp;
			notification.ready = notificationToString(notification);
			if(notification.hasOwnProperty('pushFront')){
				if(notification.seen == "False"){
					newNotifications = true;
					unreadNotifications.plus1();
				}

				notifications.unshift(notification);
				if(!this.inlineNotification){
					tmp = angular.element("<div></div>");
					tmp.html($templateCache.get(NCSigleNTemlpateURL));
					scope = $scope.$new();
					scope.notification = notification;
					compile(tmp)(scope);
					var wtf = tmp.text().replace(/\s\s+/g, ' ');
					new spawnNotification("Ora", wtf, $rootScope.clickNotification, disabledNotifications);
				}else{
					ngToast.create({
						className: 'notifi-cell',
						content: tmp.innerHTML
					});
					if(todoApp.user.getAttribute("notifications_sounds"))
						ngAudio.play("sound/notification.wav");
				}
			}else{
				notifications.push(notification);
			}
			if(notification.last){
				console.log(notifications);
				tmp = (parseInt(notification.unseen) || 0);
				unreadNotifications.set(tmp);
				if(tmp > 0){
					newNotifications = true;
				}
				loading.set(false);
			}
			
		};
		
		function noMoreNotifications(){
			allNotificationsLoaded = true;
			noMoreNotificationsCallbacks.forEach(function(callback){
				callback();
			});
		}
		
		this.setPermission = function(boolean){
			if(boolean === true && permission !== true){
				getDeveloperNotifications();
			}
			permission = boolean;
		};
		
		this.noMoreNotificationsAdd = function(callback){
			noMoreNotificationsCallbacks.push(callback);
		};
		
		this.getDeveloperNotifications = function(func){
			getDeveloperNotifications = func;
		};
		
		this.loadMoreNotifications = function(func){
			loadMoreNotifications = func;
		};
		
		this.seeNotifications = function(func){
			seeNotifications = func;
		};
		
		this.inlineNotification = function(yesorno){
			showDesktopNotifications = !yesorno;
		};
		
		this.$get = function(){
			//Let's get the first batch of notifications, this is being executed at angular.run();
			return {
				notifications: function(){
					return notifications;
				},
				allNotificationsLoaded: function(){ //{1}
					return allNotificationsLoaded;
				},
				loadMoreNotifications: function(){
					if(loading.get()){
						return;
					}
					loading.set(true);
					loadMoreNotifications(notifications.length);
				},
				seeNotifications: function(){
					seeNotifications();
					for(var index = 0; index < notifications.length; index++){
						if(notifications[index].seen == "False")
							notifications[index].seen = "True";
					}
					unreadNotifications.set(0);
				},
				noMoreNotificationsAdd: this.noMoreNotificationsAdd, //{2}
				inlineNotification: this.inlineNotification, //{2}
				setPermission: this.setPermission, //{2}
				newNotification: newNotification,
				noMoreNotifications: noMoreNotifications,
				loading: loading,
				unreadNotifications: unreadNotifications
			};
		};
	}).directive("notificationCenter", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCTemplateURL,
			scope: false,
			link: function(scope, el, attrs){
				notification.seeNotifications();
			}
		};
	}]).directive("singleNotification", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCSigleNTemlpateURL,
			scope: true
		};
	}]);
}));
/*

{1: Access to variable reference is only possible this way}
{2: Function accessible with provider and factory}

*/