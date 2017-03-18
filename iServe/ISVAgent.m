//
//  ISVAgent.m
//  iServe
//
//  Created by 杨弘宇 on 2017/3/18.
//  Copyright © 2017年 Cyandev. All rights reserved.
//

#import "ISVAgent.h"

NSNotificationName const ISVAgentSuddenTerminationNotification = @"ISVAgentSuddenTerminationNotification";

@implementation ISVAgent {
    NSString *_path;
    NSMutableData *_stdoutBuffer;
    NSFileHandle *_writer;
    NSFileHandle *_reader;
}

- (instancetype)initWithScriptPath:(NSString *)path {
    self = [super init];
    if (self) {
        _path = path;
        _stdoutBuffer = [NSMutableData data];
        [self start];
    }
    return self;
}

#pragma mark - Private

- (void)start {
    NSTask *task = [[NSTask alloc] init];
    task.launchPath = @"/usr/local/bin/node";
    task.arguments = @[[[NSBundle mainBundle] pathForResource:@"node/index.js" ofType:nil]];
    task.standardInput = [NSPipe pipe];
    task.standardOutput = [NSPipe pipe];
    task.terminationHandler = ^(NSTask *task) {
        [_writer closeFile];
        _writer = nil;
        
        [_reader closeFile];
        _reader = nil;
        
        [[NSNotificationCenter defaultCenter] postNotificationName:ISVAgentSuddenTerminationNotification object:self];
        
        [[NSRunLoop mainRunLoop] addTimer:[NSTimer timerWithTimeInterval:5 repeats:NO block:^(NSTimer * _Nonnull timer) {
            [self start];
        }] forMode:NSRunLoopCommonModes];
    };
    
    _writer = [task.standardInput fileHandleForWriting];
    _reader = [task.standardOutput fileHandleForReading];
    
    __weak typeof(self) weakSelf = self;
    _reader.readabilityHandler = ^(NSFileHandle *handle) {
        if (weakSelf) {
            __strong typeof(self) strongSelf = weakSelf;
            NSData *data = handle.availableData;
            [strongSelf->_stdoutBuffer appendData:data];
            [strongSelf handleStdoutBuffer];
        }
    };
    
    [task launch];
    
    // Verify the backend via version.
    [self sendMessage:@{@"cmd" : @"show_version"}];
}

- (void)handleStdoutBuffer {
    uint8_t *bytes = (uint8_t *) _stdoutBuffer.mutableBytes;
    for (int i = 0; i < _stdoutBuffer.length; i++) {
        // 0x0a (aka. '\n') as delimeter.
        if (bytes[i] == 0x0a) {
            NSData *subdata = [_stdoutBuffer subdataWithRange:NSMakeRange(0, i)];
            NSString *packet = [[NSString alloc] initWithData:subdata encoding:NSUTF8StringEncoding];
            [self handlePacket:packet];
            
            if (i < _stdoutBuffer.length) {
                memmove(bytes, bytes + i, _stdoutBuffer.length - i);
            }
            
            _stdoutBuffer.length = _stdoutBuffer.length - i;
            
            return;
        }
    }
}

- (void)handlePacket:(NSString *)packet {
    NSLog(@"%@", packet);
}

#pragma mark - Public

- (void)sendMessage:(NSDictionary *)msg {
    NSData *buf = [NSJSONSerialization dataWithJSONObject:msg options:0 error:nil];
    [_writer writeData:buf];
    [_writer writeData:[@"\n" dataUsingEncoding:NSUTF8StringEncoding]];
}

@end
