window.app = {
	/**
	 * netty服务器的url地址
	 */
	nettyServerUrl: 'ws://192.168.31.152:88/ws',
	
	/**
	 * tomcat服务器的url地址
	 */
	serverUrl: 'http://192.168.31.152:666',
    
    /**
     * 消息动作类型
     */
    CONNECT: 1,  // 初始化连接
    CHAT: 2,     // 聊天信息
    SIGNED: 3,   // 消息签收
    KEEPALIVE:4, // 客户端保持心跳
	
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},
	
	/**
	* 封装消息提示框，默认mui的不支持居中和自定义icon，所以使用h5+
	* @param {Object} msg
	* @param {Object} type
	*/
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, 
			{icon: "../images/" + type + ".png", verticalAlign: "center"})
	},
    
    /**
     * 初始化信息
     */
    refreshInfo: function(){
        // 触发个人中心页面的自定义事件，刷新个人信息
        var mineWebview = plus.webview.getWebviewById("mine");
        mui.fire(mineWebview, "refresh_myface");
        // 触发我的头像页面的自定义事件，刷新我的头像
        var myfaceWebview = plus.webview.getWebviewById("my-face");
        mui.fire(myfaceWebview, "refresh_myface");
        // 触发通讯录页面的自定义事件，刷新我的好友列表
        var contactWebview = plus.webview.getWebviewById("contact");
        mui.fire(contactWebview, "refresh_contact");
        // 触发好友请求页面的自定义事件，刷新好友请求列表
        var friendRequestWebview = plus.webview.getWebviewById("new-friends");
        mui.fire(friendRequestWebview, "refresh_request_list");
        // 触发聊天列表页面的自定义事件，初始化websocket
        var chatListWebview = plus.webview.getWebviewById("chat-list");
        mui.fire(chatListWebview, "init_websocket");
    },
    
	/**
	* 保存用户的全局对象
	* @param {Object} user
	*/
	setUserGlobalInfo: function(user) {
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo", userInfoStr);
	},
	
	/**
	* 获取用户的全局对象
	*/
	getUserGlobalInfo: function() {
		var userInfoStr = plus.storage.getItem("userInfo");
		return JSON.parse(userInfoStr);
	},
	/**
	* 登出后，移除用户全局对象
	*/
	userLogout: function() {
		plus.storage.removeItem("userInfo");
	},
    
    /**
     * 保存好友列表到本地
     * @param {Object} friendList 好友列表数据
     */
    setFriendList: function(friendList) {
        var friensListStr = JSON.stringify(friendList);
        plus.storage.setItem("friendList", friensListStr);
    },
    
    /**
     * 获取好友列表
     */
    getFriendList: function() {
        var friensListStr = plus.storage.getItem("friendList");
        
        if (!app.isNotNull(friensListStr)){
            return [];
        }
        
        return JSON.parse(friensListStr);
    },
    
    /**
     * 保存好友请求到本地
     * @param {Object} request 好友请求列表
     */
    setFriendRequest(request) {
        var requestStr = JSON.stringify(request);
        plus.storage.setItem("request", requestStr);
    },
    
    /**
     * 获取好友请求列表
     */
    getFriendRequest: function() {
        var requestStr = plus.storage.getItem("request");
        
        if (!app.isNotNull(requestStr)){
            return [];
        }
        
        return JSON.parse(requestStr);
    },
    
    /**
     * 聊天内容模型
     * @param {Object} senderId
     * @param {Object} receiverId
     * @param {Object} msgId
     * @param {Object} type
     * @param {Object} content
     */
    ChatMsgBo: function(senderId, receiverId, msgId, type, content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.msgId = msgId;
        this.type = type;
        this.content = content;
    },
    
    /**
     * 消息内容模型
     * @param {Object} action
     * @param {Object} chatMsg
     * @param {Object} extend
     */
    MsgContent: function(action, chatMsgBo, extend) {
        this.action = action;
        this.chatMsgBo = chatMsgBo;
        this.extend = extend;
    },
}