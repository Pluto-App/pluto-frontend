import React, { useState, useEffect, useCallback } from 'react';

import { useOvermind } from '../../../overmind';

import ActiveWindowInfo from './ActiveWindowInfo';

const StreamSection = React.memo(({stream, usersInCall, handleExpand}) => {
	const { state, actions } = useOvermind();

	return (

		<section
          	className="flex-1 center"
          	style={{
            	width: '100%',
            	position: 'relative',
            	margin: '2px',
            	cursor: stream.isVideoOn() ? 'pointer' : '',
          	}}
          	key={stream.getId()}
        >
          	<div
            	style={{
              	display:
					state.videoCallCompactMode || state.streamingScreenShare
                  	? ''
                  	: 'inline-block',
            	}}
          	>
                <div
                  	id={'ag-item-' + stream.getId()}
                  	className={
                    	stream.isVideoOn()
                      	? 'ag-item Camera ag-video-on'
                      	: 'ag-item Camera'
                  	}
                  	style={{
                    	height: '120px',
                        display: stream.isVideoOn() ? 'block' : 'none',
                  	}}
                  	onClick={() => {
                    	if (state.videoCallCompactMode) handleExpand();
                  	}}
                ></div>

            	<div
                  	id={'ag-item-info-' + stream.getId()}
          			className="ag-item-info"
                  	style={{
                        display: stream.isVideoOn() ? 'flex' : 'none',
                        bottom:
                      		state.videoCallCompactMode ||
                      		state.streamingScreenShare
                        	? '5px'
                            : '10px',
                  	}}
            	>
                  	<div style={{ display: 'table', height: '30px' }}>
                    	<span
                      		className="text-gray-200 px-1"
	                      	style={{
	                        	display: 'table-cell',
	                        	verticalAlign: 'middle',
	                      	}}
                		>
	                  		{
	                  			usersInCall[stream.getId()]
	                            ? usersInCall[stream.getId()].name.split(' ')[0]
	                            : ''
	                        }
                    	</span>
                  	</div>
                  	<div
                        className="pointer items-center flex overflow-hidden"
                        style={{ display: 'table' }}
                  	>
                    	{usersInCall[stream.getId()] &&
                          usersInCall[stream.getId()].id && (
                            <ActiveWindowInfo
                              user={usersInCall[stream.getId()]}
                              user_id={usersInCall[stream.getId()].id}
                              videoOn={true}
                            />
                          )}
                      </div>
                    </div>

                    <div
                      id={'user-details-' + stream.getId()}
                      className={stream.isVideoOn() ? '' : 'user-details'}
                      style={{
                        height: '50px',
                        display: stream.isVideoOn() ? 'none' : 'flex',
                        width:
                          state.videoCallCompactMode ||
                          state.streamingScreenShare
                            ? ''
                            : '180px',
                        margin: '10px',
                      }}
                    >
                  	
                  	<div style={{ display: 'table' }}>
                    	<div
                      		className="rounded-full"
                          	style={{
                            	display: 'table-cell',
                            	verticalAlign: 'middle',
                            	height: '50px',
                          	}}
                        >
                      		<img
                            	style={{ height: '30px' }}
                            	src={
                              		usersInCall[stream.getId()]
                                	? usersInCall[stream.getId()].avatar
                                	: ''
                            	}
                            	alt=""
                          	/>
                        </div>
                  	</div>
                  	
                  	<div
                        className="text-white px-1 font-bold pointer"
                        style={{
                          display: 'table',
                          height: '50px',
                          marginLeft: '10px',
                        }}
                        onClick={() => {
                          if (state.videoCallCompactMode) handleExpand();
                        }}
                  	>
                        <span
                          style={{
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                          }}
                        >
                          {usersInCall[stream.getId()]
                            ? usersInCall[stream.getId()].name.split(' ')[0]
                            : ''}
                        </span>
                  	</div>
                      
                  	{usersInCall[stream.getId()] &&
                        usersInCall[stream.getId()].id && (
                          <ActiveWindowInfo
                            user={usersInCall[stream.getId()]}
                            user_id={usersInCall[stream.getId()].id}
                          />
                    	)
                    }
                </div>
          	</div>
        </section>
	)
})


export default StreamSection;