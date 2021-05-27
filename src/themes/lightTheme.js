import deepMerge from '../utils/deepMerge'
import {sharedTheme} from './sharedTheme'

export const lightTheme = deepMerge({},{},sharedTheme) // target, SharedTheme, Light theme Override
