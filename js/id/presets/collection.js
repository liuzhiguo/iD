iD.presets.Collection = function(collection) {

    var presets = {

        collection: collection,

        item: function(id) {
            return _.find(collection, function(d) {
                return d.name === id;
            });
        },

        matchType: function(entity, resolver) {
            var newcollection = collection.filter(function(d) {
                return d.matchType(entity, resolver);
            });

            return iD.presets.Collection(newcollection);
        },

        matchTags: function(entity) {

            var best = -1,
                match;

            for (var i = 0; i < collection.length; i++) {
                var score = collection[i].matchTags(entity);
                if (score > best) {
                    best = score;
                    match = collection[i];
                }
            }

            return match;
        },

        search: function(value) {
            if (!value) return this;

            value = value.toLowerCase();

            var leading_name = _.filter(collection, function(a) {
                    return leading(a.name);
                }),
                leading_terms = _.filter(collection, function(a) {
                    return _.any(a.match.terms || [], leading);
                });

            function leading(a) {
                var index = a.indexOf(value);
                return index === 0 || a[index - 1] === ' ';
            }

            var levenstein_name = collection.map(function(a) {
                    return {
                        preset: a,
                        dist: iD.util.editDistance(value, a.name)
                    };
                }).filter(function(a) {
                    return a.dist - a.preset.name.length + value.length < 2;
                }).sort(function(a, b) {
                    return a.dist - b.dist;
                }).map(function(a) {
                    return a.preset;
                }),
                leventstein_terms = _.filter(collection, function(a) {
                    return _.any(a.match.terms || [], function(b) {
                        return iD.util.editDistance(value, b) - b.length + value.length < 2;
                    });
                });

            var other = presets.item('other');

            return iD.presets.Collection(
                _.unique(
                    leading_name.concat(
                        leading_terms,
                        levenstein_name,
                        leventstein_terms,
                        other)));
        }
    };

    return presets;
};