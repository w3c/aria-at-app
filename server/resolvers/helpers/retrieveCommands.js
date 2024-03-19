const commands = require('../../resources/commands.json');
const commandsV2 = require('../../resources/commandsV2.json');

function findValueByKey(keyMappings, keyToFindText) {
  const keyToFind = keyToFindText.replace(/\s+/g, ' ').trim();
  const keyMap = Object.keys(keyMappings);

  // Need to specially handle VO modifier key combination
  if (keyToFind === 'vo')
    return findValuesByKeys(keyMappings, [
      keyMappings['modifierAliases.vo']
    ])[0];

  if (keyToFind.includes('modifiers.') || keyToFind.includes('keys.')) {
    const parts = keyToFind.split('.');
    const keyToCheck = parts[parts.length - 1]; // value after the '.'

    if (keyMappings[keyToFind])
      return {
        value: keyMappings[keyToFind],
        key: keyToCheck
      };

    return null;
  }

  for (const key of keyMap) {
    const parts = key.split('.');
    const parentKey = parts[0];
    const keyToCheck = parts[parts.length - 1]; // value after the '.'

    if (keyToCheck === keyToFind) {
      if (parentKey === 'modifierAliases') {
        return findValueByKey(keyMappings, `modifiers.${keyMappings[key]}`);
      } else if (parentKey === 'keyAliases') {
        return findValueByKey(keyMappings, `keys.${keyMappings[key]}`);
      }

      return {
        value: keyMappings[key],
        key: keyToCheck
      };
    }
  }

  // Return null if the key is not found
  return null;
}

function findValuesByKeys(commandsMapping, keysToFind = []) {
  const result = [];

  const patternSepWithReplacement = (keyToFind, pattern, replacement) => {
    if (keyToFind.includes(pattern)) {
      let value = '';
      let validKeys = true;
      const keys = keyToFind.split(pattern);

      for (const key of keys) {
        const keyResult = findValueByKey(commandsMapping, key);
        if (keyResult)
          value = value
            ? `${value}${replacement}${keyResult.value}`
            : keyResult.value;
        else validKeys = false;
      }
      if (validKeys) return { value, key: keyToFind };
    }

    return null;
  };

  const patternSepHandler = keyToFind => {
    let value = '';

    if (keyToFind.includes(' ') && keyToFind.includes('+')) {
      const keys = keyToFind.split(' ');
      for (let [index, key] of keys.entries()) {
        const keyToFindResult = findValueByKey(commandsMapping, key);
        if (keyToFindResult) keys[index] = keyToFindResult.value;
        if (key.includes('+'))
          keys[index] = patternSepWithReplacement(key, '+', '+').value;
      }
      value = keys.join(' then ');

      return { value, key: keyToFind };
    } else if (keyToFind.includes(' '))
      return patternSepWithReplacement(keyToFind, ' ', ' then ');
    else if (keyToFind.includes('+'))
      return patternSepWithReplacement(keyToFind, '+', '+');
  };

  for (const keyToFind of keysToFind) {
    if (keyToFind.includes(' ') || keyToFind.includes('+')) {
      result.push(patternSepHandler(keyToFind));
    } else {
      const keyToFindResult = findValueByKey(commandsMapping, keyToFind);
      if (keyToFindResult) result.push(keyToFindResult);
    }
  }

  return result;
}

const getCommandV1 = commandId => {
  return commands.find(command => command.id === commandId);
};

const getCommandV2 = commandId => {
  return findValuesByKeys(commandsV2, [commandId]);
};

module.exports = {
  getCommandV1,
  getCommandV2
};
