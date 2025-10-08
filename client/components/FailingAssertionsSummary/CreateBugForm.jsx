import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Form for creating a new AT bug
 */
const CreateBugForm = ({
  onCreateBug,
  onCancel,
  creating,
  error,
  checkDuplicateUrl
}) => {
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
      // Reset form (parent will handle mode switching)
      setFormData({ title: '', bugId: '', url: '' });
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend style={{ fontSize: 16 }}>Add New Bug Link</legend>

        <div className="mb-2">
          <label className="form-label" htmlFor="new-bug-title">
            Link Text
          </label>
          <input
            id="new-bug-title"
            name="title"
            type="text"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label" htmlFor="new-bug-id">
            ID
          </label>
          <input
            id="new-bug-id"
            name="bugId"
            type="number"
            className="form-control"
            value={formData.bugId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label" htmlFor="new-bug-url">
            URL
          </label>
          <input
            id="new-bug-url"
            name="url"
            type="url"
            className={`form-control${duplicateUrl ? ' is-invalid' : ''}`}
            value={formData.url}
            onChange={handleChange}
            required
            aria-invalid={!!duplicateUrl}
          />
          {duplicateUrl && (
            <div className="invalid-feedback">
              This URL already exists as Bug #{duplicateUrl.bugId}:{' '}
              <a
                href={duplicateUrl.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {duplicateUrl.title}
              </a>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-outline-secondary btn-sm"
          disabled={creating || hasDuplicate}
        >
          {creating ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          className="btn btn-link btn-sm ms-2"
          onClick={onCancel}
        >
          Back to list
        </button>
        {error && (
          <div className="text-danger mt-2" role="alert">
            {error.message}
          </div>
        )}
      </fieldset>
    </form>
  );
};

CreateBugForm.propTypes = {
  onCreateBug: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  creating: PropTypes.bool,
  error: PropTypes.object,
  checkDuplicateUrl: PropTypes.func
};

export default CreateBugForm;
