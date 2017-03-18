//
//  ISVAgent.h
//  iServe
//
//  Created by 杨弘宇 on 2017/3/18.
//  Copyright © 2017年 Cyandev. All rights reserved.
//

#import <Foundation/Foundation.h>

extern NSNotificationName const ISVAgentSuddenTerminationNotification;

@interface ISVAgent : NSObject

- (instancetype)initWithScriptPath:(NSString *)path;

- (void)sendMessage:(NSDictionary *)msg;

@end
