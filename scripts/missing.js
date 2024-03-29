import * as Types from '../ri18next.config.js'

/**
 * @function traverse
 * @description Traverse the translation object and add the key-value pairs to a map
 * @param {Object} node The current node
 * @param {Map<string, string>} map The map with the key-value pairs
 * @param {Array<string>} path The path of the current node
 * @param {Array<string>} [filterThese] The keys to filter out
 * @param {boolean} [codeCheck] Check for code keys
 * @returns {Array<string>} The map with the key-value pairs
 */
const traverse = (node, map, path, filterThese, codeCheck) => {
	const keys = []
	const regex = /\$t\((.*?)\)/
	if (typeof node === 'object') {
		Object.entries(node).forEach(([key, value]) => {
			const match = regex.exec(value)
			if (match && codeCheck) filterThese.push(match[1].replace(/['"]/g, ''))
			const currentPath = [...path, key.split('_')[0]]
			keys.push(...traverse(node[key], map, currentPath, filterThese, codeCheck))
		})
	} else {
		keys.push(path.join('.'))
	}

	return codeCheck ? keys.filter(key => !filterThese.includes(key)) : keys
}

/**
 * @function missingKeysInTranslation
 * @description Check for missing keys in translation file
 * @param {Map} translation The translation file
 * @param {Array<string>} codeKeys The keys from the code
 * @param {Types.Config} config The config for the validator
 * @returns {void}
 */
export const missingKeysInTranslation = (translation, codeKeys, config) => {
	console.info('[🟡] Checking for missing keys in translation...')
	const translationKeys = traverse(translation, new Map(), [])
	const missingKeys = codeKeys
		.filter(key => !translationKeys.includes(key))
		.filter(key => !config.ignoreKeys.includes(key))

	if (config.errorLevel === 'off') return
	if (missingKeys.length > 0) {
		const errorMessage = `[❌] Missing keys in translation:\n${JSON.stringify(missingKeys, null, 2)}`
		if (config.errorLevel === 'error') throw new Error(errorMessage)
		if (config.errorLevel === 'warn') console.warn(errorMessage)
	} else {
		console.info('[✅] No missing keys found.')
	}

	console.info('----------------------------------------')
}

/**
 * @function missingKeysInCode
 * @description Check for missing keys in code
 * @param {Map} translation The translation file
 * @param {Array<string>} codeKeys The keys from the code
 * @param {Types.Config} config The config for the validator
 * @returns {void}
 */
export const missingKeysInCode = (translation, codeKeys, config) => {
	console.info('[🟡] Checking for missing keys in code...')
	const translationKeys = traverse(translation, new Map(), [], [], true)
	const missingKeys = translationKeys
		.filter(key => !codeKeys.includes(key))
		.filter(key => !config.ignoreKeys.includes(key))

	if (config.errorLevel === 'off') return
	if (missingKeys.length > 0) {
		const errorMessage = `[❌] Missing keys in code:\n${JSON.stringify(missingKeys, null, 2)}`
		if (config.errorLevel === 'error') throw new Error(errorMessage)
		if (config.errorLevel === 'warn') console.warn(errorMessage)
	} else {
		console.info('[✅] No missing keys found.')
	}

	console.info('----------------------------------------')
}
