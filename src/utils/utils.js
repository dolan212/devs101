export function randomString(length) {
    return (Math.random() + 1).toString(36);
}

export function generateValidColourCode(length) {
	var letters = '0123456789ABCDEFabcdef';
	var colour = "#";
	for(var i = 0; i < length; i++) {
		colour += letters[Math.floor(Math.random() * 22)];
	}
	return colour;
}

export function generateInvalidColourCode(length) {
	var letters = 'ghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=/?,.<>:;\'\"{}[]\\|`~';
	var colour = "#";
	for(var i = 0; i < length; i++) {
		colour += letters[Math.floor(Math.random() * letters.length)];
	}
	return colour;
}
