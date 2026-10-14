import React from 'react';
import {Composition} from 'remotion';
import {Ddos, durationInFrames as ddosFrames} from './Ddos';
import {Mensageria, durationInFrames as msgFrames} from './Mensageria';

// Cada reel é uma composição vertical 1080 × 1920 a 30 fps.
export const Root: React.FC = () => <>
  <Composition id="Ddos" component={Ddos} width={1080} height={1920} fps={30} durationInFrames={ddosFrames} />
  <Composition id="Mensageria" component={Mensageria} width={1080} height={1920} fps={30} durationInFrames={msgFrames} />
</>;
