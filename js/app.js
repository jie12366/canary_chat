window.app = {
	/**
	 * netty服务器的url地址
	 */
	nettyServerUrl: 'ws://jie12366.xyz:888/ws',
	
	/**
	 * tomcat服务器的url地址
	 */
	serverUrl: 'https://jie12366.xyz:66',
    
    /**
     * 默认的头像
     */
    defaultFace: "https://pic.feizl.com/upload/allimg/190123/gxtxjslmijsvh4m.jpg",
    
    /**
     * 消息动作类型
     */
    CONNECT: 1,  // 初始化连接
    CHAT: 2,     // 聊天信息
    SIGNED: 3,   // 消息签收
    KEEPALIVE:4, // 客户端保持心跳
    PULL_FRIEND: 5, // 拉取最新好友列表
    
    /**
     * 聊天信息发送者
     */
    FRIEND: 1, // 朋友
    SELF: 2, // 自己
	
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
        // 触发聊天列表页面的自定义事件
        var chatListWebview = plus.webview.getWebviewById("chat-list");
        // 初始化websocket
        mui.fire(chatListWebview, "init_websocket");
        // 刷新聊天快照列表
        mui.fire(chatListWebview, "refresh_chat_snapshot");
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
     * 根据friendId从联系人列表中获取联系人信息
     * @param {Object} friendId
     */
    getInfoByFriendId: function(friendId) {
        var that = this;
        var contactList = that.getFriendList();
        if (contactList != null) {
            for (var i = 0; i < contactList.length; ++i) {
                var friendItem = contactList[i];
                if (friendItem.id == friendId) {
                    return friendItem;
                }
            }
        } else {
            return null;
        }
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
     * 保存用户的聊天记录
     * @param {Object} myId
     * @param {Object} FriendId
     * @param {Object} content
     * @param {Object} sender 判断该消息的发送者,zs指朋友,self指自己
     */
    saveChatRecord: function(myId, friendId, sender, type, content) {
        var that = this;
        // 聊天记录唯一标识
        var chatKey = "chat-" + myId + "-" + friendId;
        // 从本地获取聊天记录
        var chatRecordStr = plus.storage.getItem(chatKey);
        var chatRecordList;
        // 如果存在
        if (that.isNotNull(chatRecordStr)) {
            chatRecordList = JSON.parse(chatRecordStr);
        } else {
            // 如果不存在,则赋空集合
            chatRecordList = [];
        }
        // 构建聊天记录对象
        var singleMsg = new that.ChatRecord(sender, type, content);
        // 向聊天记录集合中追加记录
        chatRecordList.push(singleMsg);
        // 保存聊天记录集合
        plus.storage.setItem(chatKey, JSON.stringify(chatRecordList));
    },
    
    /**
     * 获取聊天记录集合
     * @param {Object} myId
     * @param {Object} friendId
     */
    getChatRecord: function(myId, friendId) {
        var that = this;
        // 聊天记录唯一标识
        var chatKey = "chat-" + myId + "-" + friendId;
        var chatRecordStr = plus.storage.getItem(chatKey);
        var chatRecordList;
        // 如果存在
        if (that.isNotNull(chatRecordStr)) {
            chatRecordList = JSON.parse(chatRecordStr);
        } else {
            // 如果不存在,则赋空集合
            chatRecordList = [];
        }
        return chatRecordList;
    },
    
    /**
     * 保存聊天记录的快照, 仅仅保存每次聊天的最后一条消息
     * @param {Object} myId
     * @param {Object} friendId
     * @param {Object} content
     * @param {Object} isRead 消息是否已读
     */
    saveChatSnapshot: function(myId, friendId, content, isRead) {
        var that = this;
        // 聊天快照标识
        var chatKey = "chat-snapshot-" + myId;
        // 从本地获取聊天记录
        var chatSnapshotStr = plus.storage.getItem(chatKey);
        var chatSnapshoList;
        // 如果存在
        if (that.isNotNull(chatSnapshotStr)) {
            chatSnapshoList = JSON.parse(chatSnapshotStr);
            // 循环快照集合,并判断聊天快照是否已经存在
            for (var i = 0; i < chatSnapshoList.length; ++i) {
                if (chatSnapshoList[i].friendId == friendId) {
                    // 删除已存在的聊天快照
                    chatSnapshoList.splice(i, 1);
                    break;
                }
            }
        } else {
            // 如果不存在,则赋空集合
            chatSnapshoList = [];
        }
        // 构建聊天快照对象
        var singleSnapshot = new that.ChatSnapshot(friendId, content, isRead);
        // 向聊天快照集合的开头添加刚刚构建的快照
        chatSnapshoList.unshift(singleSnapshot);
        // 保存聊天快照集合
        plus.storage.setItem(chatKey, JSON.stringify(chatSnapshoList));
    },
    
    /**
     * 更新聊天快照集合
     * @param {Object} chatSnapshotList
     */
    updateChatSnapshot: function(myId, chatSnapshotList) {
        // 聊天快照标识
        var chatKey = "chat-snapshot-" + myId;
        // 更新聊天快照
        plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
    },
    
    /**
     * 获取聊天快照集合
     * @param {Object} myId
     */
    getChatSnapshot: function(myId) {
        var that = this;
        // 聊天快照标识
        var chatKey = "chat-snapshot-" + myId;
        // 从本地获取聊天记录
        var chatSnapshotStr = plus.storage.getItem(chatKey);
        var chatSnapshoList;
        // 如果存在
        if (that.isNotNull(chatSnapshotStr)) {
            chatSnapshoList = JSON.parse(chatSnapshotStr);
        } else {
            // 如果不存在,则赋空集合
            chatSnapshoList = [];
        }
        return chatSnapshoList;
    },
    
    /**
     * 聊天内容对象模型
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
     * 消息内容对象模型
     * @param {Object} action
     * @param {Object} chatMsg
     * @param {Object} extend
     */
    MsgContent: function(action, chatMsgBo, extend) {
        this.action = action;
        this.chatMsgBo = chatMsgBo;
        this.extend = extend;
    },
    
    /**
     * 聊天记录对象模型
     * @param {Object} content
     * @param {Object} type
     * @param {Object} sender
     */
    ChatRecord: function(sender, type, content) {
        this.content = content;
        this.type = type;
        this.sender = sender;
    },
    
    /**
     * 聊天快照对象模型
     * @param {Object} friendId
     * @param {Object} content
     * @param {Object} isRead
     */
    ChatSnapshot: function(friendId, content, isRead) {
        this.friendId = friendId;
        this.content = content;
        this.isRead = isRead;
    }
}