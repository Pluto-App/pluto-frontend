import deepMerge from '../utils/deepMerge'
import {sharedTheme} from './sharedTheme'

export const darkTheme = deepMerge({},{},sharedTheme) // target, SharedTheme, Light theme Override
