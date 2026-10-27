(function() {
    data.requests = [];

    // Link for the empty state: the catalog item's sys_id
    var item = new GlideRecord('sc_cat_item');
    if (item.get('name', 'Request a new laptop')) {
        data.catItemId = item.getUniqueValue();
    }

    // GlideRecordSecure respects ACLs, so users only see what they're allowed to
    var gr = new GlideRecordSecure('sc_req_item');
    gr.addQuery('requested_for', gs.getUserID());
    gr.addQuery('cat_item.name', 'Request a new laptop');
    gr.orderByDesc('opened_at');
    gr.setLimit(20);
    gr.query();

    while (gr.next()) {
        data.requests.push({
            sys_id: gr.getUniqueValue(),
            number: gr.getValue('number'),
            model: gr.variables.laptop_model.getDisplayValue(),
            needed_by: gr.variables.needed_by.getDisplayValue(),
            opened: gr.getDisplayValue('opened_at'),
            status: getStatus(gr)
        });
    }

    // One clear status per request, based on approval first, then state
    function getStatus(rec) {
        var approval = rec.getValue('approval');
        var state = rec.getValue('state');
        if (approval == 'rejected')  return { key: 'rejected', label: 'Rejected' };
        if (approval == 'requested') return { key: 'pending',  label: 'Waiting for manager approval' };
        if (state == '3')            return { key: 'complete', label: 'Completed' };
        if (state == '4' || state == '7') return { key: 'closed', label: 'Closed' };
        return { key: 'approved', label: 'Approved – being prepared' };
    }
})();
