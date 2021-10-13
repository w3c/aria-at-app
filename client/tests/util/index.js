export const findByTestAttr = function(wrapper, val) {
    return wrapper.find(`[data-test="${val}"]`);
};
