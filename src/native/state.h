#include <napi.h>
#include "portaudio.h"
#include <liquid.h>
#include <unordered_map> 
#include <vector>
#include <iostream>

#ifndef STATE_HEADER_H
#define STATE_HEADER_H

static bool REPSYS_LOG = false;

typedef struct{
  float volume;
  double time;
  bool playing;
  int period;
} playback;

typedef struct{
  float volume;
  int offset;
  bool destroy;
} mixTrackSourceConfig;

typedef struct{
  std::unordered_map<std::string, mixTrackSourceConfig*> sourceTracksParams;
  std::vector<int> chunks;
  float alpha;
  float volume;
  bool playing;
  bool loop;
  bool muted;
  float filter;
  bool aperiodic;
  bool nextAtChunk;
  int chunkIndex;
} mixTrackPlayback;

typedef struct{
  mixTrackPlayback* playback;
  mixTrackPlayback* nextPlayback;
  bool hasNext;
  double sample;
  firfilt_rrrf filter;
  bool hasFilter;
  bool removed;
} mixTrack;

typedef struct{
  std::vector<float*>  channels;
  int length;
  bool removed;
  uint8_t ** data;
} source;

typedef struct{
  std::vector<float*>  channels;
  int size;
  int head;
  int tail;
} ringbuffer;

typedef struct{
  std::vector<float*>  channels;
  int size;
  int used;
  int* bounds;
  int boundsCount;
} recordChunk;

typedef struct{
  bool started;
  bool fromSource;
  std::string fromSourceId;
  unsigned int fromSourceOffset;
  std::vector<recordChunk*> chunks;
  unsigned int chunkIndex;
  int length;
} recording;

typedef struct{
  ringbuffer *buffer;
  float *window;
  unsigned int windowSize;
  playback *playback;
  std::unordered_map<std::string, mixTrack*> mixTracks;
  std::unordered_map<std::string, source*> sources;
  recording* recording;
} streamState;

#endif