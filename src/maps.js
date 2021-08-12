const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

//map for browser json schema
const schemaMap = {
  "http://www.geneontology.org/formats/oboInOwl#hasDefinition": "definition",
  "http://www.w3.org/2000/01/rdf-schema#label": "text",
  "http://www.geneontology.org/formats/oboInOwl#hasExactSynonym":
    "exact_synonyms",
  "http://www.geneontology.org/formats/oboInOwl#hasNarrowSynonym":
    "narrow_synonyms",
  "http://www.w3.org/2000/01/rdf-schema#comment": "comment",
};

//map for meta data for the whole ontology
const metaMap = {
  "http://purl.obolibrary.org/obo/date": "date",
  "http://usefulinc.com/ns/doap#Version": "version",
  "http://purl.obolibrary.org/obo/edam#repository": "repository",
  "http://xmlns.com/foaf/0.1/logo": "logo",
  "http://xmlns.com/foaf/0.1/page": "homepage",
};

//map for tsv/csv headers and their approriate parsed keys
const tsvMap = {
  "Class ID": "data.uri",
  "Preferred Label": "text",
  Synonyms: ["exact_synonyms", "narrow_synonyms"],
  Definitions: "definition",
  Obsolete: "http://www.w3.org/2002/07/owl#deprecated",
  CUI: "",
  "Semantic Types": "",
  Parents: "superclasses",
  Citation: "",
  "Created in": "http://edamontology.org/created_in",
  "deprecation candidate": "http://edamontology.org/is_deprecation_candidate",
  "deprecation comment": "http://edamontology.org/deprecation_comment",
  Documentation: "http://edamontology.org/documentation",
  Example: "http://edamontology.org/example",
  "File Extention": "http://edamontology.org/file_extension",
  "has format": "",
  "has function": "",
  "has identifier": "",
  "has input": "has_input",
  "has output": "has_output",
  "has topic": "has_topic",
  hasHumanReadsbleId:
    "http://www.geneontology.org/formats/oboInOwl#hasHumanReadableId",
  "http://data.bioontology.org/metadata/prefixIRI": `split("/").pop();`,
  "http://edamontology.org/comment_handle": "",
  "http://edamontology.org/next_id": "",
  "http://purl.obolibrary.org/obo/date": "",
  "http://purl.obolibrary.org/obo/edam#data": "",
  "http://purl.obolibrary.org/obo/edam#edam": "",
  "http://purl.obolibrary.org/obo/edam#events": "",
  "http://purl.obolibrary.org/obo/edam#formats": "",
  "http://purl.obolibrary.org/obo/edam#identifiers": "",
  "http://purl.obolibrary.org/obo/edam#obsolete": "",
  "http://purl.obolibrary.org/obo/edam#operations": "",
  "http://purl.obolibrary.org/obo/edam#placeholder": "",
  "http://purl.obolibrary.org/obo/edam#topics": "",
  "http://purl.obolibrary.org/obo/idspace": "",
  "http://purl.obolibrary.org/obo/is_anti_symmetric": "",
  "http://purl.obolibrary.org/obo/is_metadata_tag": "",
  "http://purl.obolibrary.org/obo/is_reflexive": "",
  "http://purl.obolibrary.org/obo/is_symmetric": "",
  "http://purl.obolibrary.org/obo/namespace": "",
  "http://purl.obolibrary.org/obo/remark": "",
  "http://purl.obolibrary.org/obo/transitive_over": "",
  "http://purl.org/dc/elements/1.1/contributor": "",
  "http://purl.org/dc/elements/1.1/creator": "",
  "http://purl.org/dc/elements/1.1/format": "",
  "http://purl.org/dc/elements/1.1/title": "",
  "http://usefulinc.com/ns/doap#Version": "",
  "http://www.geneontology.org/formats/oboInOwl#comment": "comment",
  "http://www.geneontology.org/formats/oboInOwl#consider":
    "http://www.geneontology.org/formats/oboInOwl#consider",
  "http://www.geneontology.org/formats/oboInOwl#hasAlternativeId":
    "http://www.geneontology.org/formats/oboInOwl#hasAlternativeId",
  "http://www.geneontology.org/formats/oboInOwl#hasBroadSynonym":
    "http://www.geneontology.org/formats/oboInOwl#hasBroadSynonym",
  "http://www.geneontology.org/formats/oboInOwl#hasDbXRef":
    "http://www.geneontology.org/formats/oboInOwl#hasDbXRef",
  "http://www.geneontology.org/formats/oboInOwl#hasDbXref":
    "http://www.geneontology.org/formats/oboInOwl#hasDbXref",
  "http://www.geneontology.org/formats/oboInOwl#hasDefinition": "definition",
  "http://www.geneontology.org/formats/oboInOwl#hasExactSynonym":
    "exact_synonyms",
  "http://www.geneontology.org/formats/oboInOwl#hasHumanReadableId":
    "http://www.geneontology.org/formats/oboInOwl#hasHumanReadableId",
  "http://www.geneontology.org/formats/oboInOwl#hasNarrowSynonym":
    "narrow_synonyms",
  "http://www.geneontology.org/formats/oboInOwl#hasRelatedSynonym":
    "http://www.geneontology.org/formats/oboInOwl#hasRelatedSynonym",
  "http://www.geneontology.org/formats/oboInOwl#hasSubset": "",
  "http://www.geneontology.org/formats/oboInOwl#inSubset":
    "http://www.geneontology.org/formats/oboInOwl#inSubset",
  "http://www.geneontology.org/formats/oboInOwl#isCyclic": "",
  "http://www.geneontology.org/formats/oboInOwl#replacedBy":
    "http://www.geneontology.org/formats/oboInOwl#replacedBy",
  "http://www.geneontology.org/formats/oboInOwl#savedBy": "",
  "http://www.geneontology.org/formats/oboInOwl#SubsetProperty": "",
  "http://xmlns.com/foaf/0.1/page": "",
  "Information standard": "http://edamontology.org/information_standard",
  "is format of": "is_format_of",
  "is function of": "",
  "is identifier of": "is_identifier_of",
  "is input of": "",
  "is output of": "",
  "is topic of": "",
  isdebtag: "http://edamontology.org/isdebtag",
  "Media type": "http://edamontology.org/media_type",
  notRecommendedForAnnotation:
    "http://edamontology.org/notRecommendedForAnnotation",
  "Obsolete since": "http://edamontology.org/obsolete_since",
  "Old parent": "http://edamontology.org/oldParent",
  "Old related": "",
  "Ontology used": "http://edamontology.org/ontology_used",
  Organisation: "http://edamontology.org/organisation",
  refactor_candidate: "http://edamontology.org/is_refactor_candidate",
  refactor_comment: "http://edamontology.org/refactor_comment",
  "Regular expression": "http://edamontology.org/regex",
  Repository: "http://edamontology.org/repository",
  thematic_editor: "",
};

export { classVal, subClassVal, schemaMap, metaMap, tsvMap };
