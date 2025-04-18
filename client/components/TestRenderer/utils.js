import React from 'react';
import nextId from 'react-id-generator';
import ReactHtmlParser from 'react-html-parser';
import supportJson from '@client/resources/support.json';
import { unescape } from 'lodash';
import commonStyles from '../common/styles.module.css';

const parseRichContentFromArray = (instruction = []) => {
  let content = null;
  for (let value of instruction) {
    if (typeof value === 'string') {
      if (value === '.')
        content = (
          <>
            {content}
            {value}
          </>
        );
      else
        content = (
          <>
            {content} {value}
          </>
        );
    } else if ('href' in value) {
      const { href, description } = value;
      content = (
        <>
          {content} <a href={href}>{description}</a>
        </>
      );
    }
  }
  return content;
};

const parseListContent = (instructions = [], commandsContent = null) => {
  return instructions.map((value, index) => {
    if (typeof value === 'string')
      return (
        <li key={nextId()}>
          {ReactHtmlParser(value)}
          {commandsContent && index === instructions.length - 1 && (
            <ul className={commonStyles.bulletList}>{commandsContent}</ul>
          )}
        </li>
      );
    else if (Array.isArray(value))
      return (
        <li key={nextId()}>
          {parseRichContentFromArray(value)}
          {commandsContent && index === instructions.length - 1 && (
            <ul className={commonStyles.bulletList}>{commandsContent}</ul>
          )}
        </li>
      );
  });
};

const parseSettingsContent = (settings, settingsMap) => {
  let settingsContent = [];
  Object.keys(settings).forEach(key => {
    if (key !== 'defaultMode') {
      const settingInstructions = settings[key];
      const text = `${supportJson.testPlanStrings.settingInstructionsPreface} ${settingsMap[key].screenText}:`;
      const instructions = settingInstructions
        .slice(1)
        .map(instruction => unescape(instruction));

      settingsContent.push(
        <div key={key}>
          {text}
          <ol>
            {instructions.map((instruction, index) => {
              return (
                <li key={`SettingInstruction_${index}`}>
                  {ReactHtmlParser(instruction)}
                </li>
              );
            })}
          </ol>
        </div>
      );
    }
  });
  return settingsContent;
};

export { parseListContent, parseSettingsContent };
