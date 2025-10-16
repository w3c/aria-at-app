import React, { useState, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../common/FormField';

const CreateBugForm = forwardRef(
  (
    { onCreateBug, onCancel, creating, error, checkDuplicateUrl, showButtons },
    ref
  ) => {
    const [formData, setFormData] = useState({
      title: '',
      bugId: '',
      url: ''
    });

    const duplicateUrl = useMemo(
      () => checkDuplicateUrl?.(formData.url),
      [checkDuplicateUrl, formData.url]
    );

    const hasDuplicate = !!duplicateUrl;

    const handleSubmit = async e => {
      e.preventDefault();
      if (hasDuplicate) return;

      const created = await onCreateBug(formData);
      if (created) {
        setFormData({ title: '', bugId: '', url: '' });
      }
    };

    const handleChange = e => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const buttonLabel = creating ? 'Saving…' : 'Save';
    const buttonClass = 'btn btn-primary btn-sm';

    return (
      <form ref={ref} onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">Add New Bug Link</legend>

          <FormField
            id="new-bug-title"
            name="title"
            label="Link Text"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <FormField
            id="new-bug-id"
            name="bugId"
            label="ID"
            type="number"
            value={formData.bugId}
            onChange={handleChange}
            required
          />

          <FormField
            id="new-bug-url"
            name="url"
            label="URL"
            type="url"
            value={formData.url}
            onChange={handleChange}
            required
            error={
              duplicateUrl
                ? `This URL already exists as Bug #${duplicateUrl.bugId}: ${duplicateUrl.title}`
                : null
            }
          />

          {showButtons && (
            <>
              <button
                type="submit"
                className={buttonClass}
                disabled={creating || hasDuplicate}
              >
                {buttonLabel}
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm ms-2"
                onClick={onCancel}
              >
                Back to list
              </button>
            </>
          )}
          {error && (
            <div className="text-danger mt-2" role="alert">
              {error.message}
            </div>
          )}
        </fieldset>
      </form>
    );
  }
);

CreateBugForm.displayName = 'CreateBugForm';

CreateBugForm.propTypes = {
  onCreateBug: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  creating: PropTypes.bool,
  error: PropTypes.object,
  checkDuplicateUrl: PropTypes.func,
  showButtons: PropTypes.bool
};

export default CreateBugForm;
