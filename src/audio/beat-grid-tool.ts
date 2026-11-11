import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { decodeAudioMono } from '../utils/exec-ffmpeg.js';
import { resolveInput, resolveOutput } from '../utils/resource.js';
import { ANALYSIS_SR, analyzeBeatGrid } from './beat-grid.js';
import { type AudioBeatGridParams, audioBeatGridSchema } from './types.js';

/** Register audio_beat_grid (TODO #34). */
export function registerBeatGridTool(server: McpServer): void {
  registerTool<AudioBeatGridParams>(
    server,
    'audio_beat_grid',
    'Beat grid for cutting video to music: tempo, beat times, and which beat the listener feels. Measures kick (40-120 Hz) and snare/clap (1.5-5 kHz) energy at every beat, finds the bar position carrying the kick (kick_phase → downbeats[], half_bar[] = kick + mid-bar), and offset_s, the median gap from the grid to the kick attack (add it to a beat to land a cut on the hit). sections[] reports the kick phase per stretch of the song (null where there is no clear kick, e.g. a drumless intro). Snap cuts and effects to downbeats or half_bar, not to arbitrary beats. Local analysis (ffmpeg decode, no API), a few seconds for a full song.',
    audioBeatGridSchema.shape,
    async ({ input, start, end, output, beats_per_bar, bpm_hint }) => {
      if (start !== undefined && end !== undefined && end <= start) {
        throw new Error(`audio_beat_grid: end (${end}) must be after start (${start}).`);
      }
      const inR = await resolveInput(input);
      try {
        const samples = await decodeAudioMono(inR.localPath, ANALYSIS_SR, { start, end });
        if (samples.length < ANALYSIS_SR * 2) {
          throw new Error('audio_beat_grid: need at least 2 seconds of audio to find a beat.');
        }
        const grid = analyzeBeatGrid(samples, ANALYSIS_SR, {
          timeOffset: start ?? 0,
          beatsPerBar: beats_per_bar,
          bpmHint: bpm_hint,
        });
        const analysed = { start: start ?? 0, end: (start ?? 0) + samples.length / ANALYSIS_SR };
        const full = { input, analysed, ...grid };

        if (!output) {
          return { content: [{ type: 'text', text: JSON.stringify(full) }] };
        }

        const outR = await resolveOutput(output);
        try {
          await mkdir(dirname(outR.localPath), { recursive: true });
          await writeFile(outR.localPath, JSON.stringify(full, null, 2));
          await outR.commit();
        } finally {
          await outR.cleanup?.();
        }
        const { beats, downbeats, half_bar, beat_energy, ...summary } = full;
        void beat_energy;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  output,
                  ...summary,
                  beat_count: beats.length,
                  downbeat_count: downbeats.length,
                  half_bar_count: half_bar.length,
                  first_downbeats: downbeats.slice(0, 8),
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );
}
