//
//  AppDelegate.m
//  iServe
//
//  Created by 杨弘宇 on 2017/3/18.
//  Copyright © 2017年 Cyandev. All rights reserved.
//

#import "AppDelegate.h"

#import "ISVAgent.h"

@interface AppDelegate ()

@property (strong) ISVAgent *agent;

@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    self.agent = [[ISVAgent alloc] initWithScriptPath:@"a"];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleAgentSuddenTermination:) name:ISVAgentSuddenTerminationNotification object:nil];
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleAgentSuddenTermination:(NSNotification *)note {
    NSUserNotification *un = [[NSUserNotification alloc] init];
    un.title = @"iServe Backend Crashed";
    un.informativeText = @"Trying to resume after 5 seconds...";
    
    [[NSUserNotificationCenter defaultUserNotificationCenter] scheduleNotification:un];
}

@end
