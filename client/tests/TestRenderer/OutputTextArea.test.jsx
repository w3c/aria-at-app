/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import OutputTextArea from '../../components/TestRenderer/OutputTextArea';
import '@testing-library/jest-dom/extend-expect';
import { NO_OUTPUT_STRING } from '../../components/TestRenderer/OutputTextArea/constants';

describe('OutputTextArea', () => {
  let atOutputMock;
  const change = value => {
    atOutputMock.value = value;
  };

  atOutputMock = {
    description: [
      'Description',
      {
        required: true,
        highlightRequired: true,
        description: 'Highlight Description'
      }
    ],
    value: '',
    change: change,
    focus: false
  };

  it('should render with default settings', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('No output')).not.toBeChecked();
  });

  it('should render correct label and checkbox', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('No output')).toBeInTheDocument();
  });

  it('should update the textarea with the correct value when checkbox is checked', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    const checkbox = screen.getByLabelText('No output');
    const textarea = screen.getByLabelText('Description');

    expect(textarea.value).toBe('');

    fireEvent.click(checkbox);
    expect(atOutputMock.value).toBe(NO_OUTPUT_STRING);
  });

  it('should handle textarea change', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    const textarea = screen.getByLabelText('Description');
    fireEvent.change(textarea, { target: { value: 'test value' } });
    expect(atOutputMock.value).toBe('test value');
  });

  it('should disable the textarea when the checkbox is checked', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    const checkbox = screen.getByLabelText('No output');
    const textarea = screen.getByLabelText('Description');

    expect(textarea).not.toBeDisabled();
    fireEvent.click(checkbox);
    expect(textarea).toBeDisabled();
  });

  it('should have associated label for textarea', () => {
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={atOutputMock}
        isSubmitted={false}
      />
    );
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('id', 'speechoutput-0');
  });

  it('should disable checkbox when textarea has a value', () => {
    const prefilledMock = { ...atOutputMock, value: 'test value' };
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={prefilledMock}
        isSubmitted={false}
      />
    );
    const checkbox = screen.getByLabelText('No output');
    expect(checkbox).toBeDisabled();
  });

  it('should enable checkbox when textarea loads with no output default value', () => {
    const prefilledMock = { ...atOutputMock, value: NO_OUTPUT_STRING };
    render(
      <OutputTextArea
        commandIndex={0}
        atOutput={prefilledMock}
        isSubmitted={false}
      />
    );
    const checkbox = screen.getByLabelText('No output');
    expect(checkbox).not.toBeDisabled();
  });
});
