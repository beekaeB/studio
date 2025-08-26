import {createNextApiHandler} from '@genkit-ai/next';
import '@/ai/flows/generate-midi-from-prompt';

export const {GET, POST} = createNextApiHandler();
