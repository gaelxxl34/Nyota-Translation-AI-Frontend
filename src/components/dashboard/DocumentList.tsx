// Document List Component
// Search, filter, and paginated grid of bulletin cards

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BulletinRecord, FilterType, DocumentTypeCounts } from '../../types/bulletin';
import { getBulletinDisplayData } from '../../utils/bulletinTransformers';

interface DocumentListProps {
  bulletins: BulletinRecord[];
  filteredBulletins: BulletinRecord[];
  paginatedBulletins: BulletinRecord[];
  selectedBulletin: BulletinRecord | null;
  isLoading: boolean;
  searchQuery: string;
  filterType: FilterType;
  documentTypeCounts: DocumentTypeCounts;
  currentPage: number;
  itemsPerPage: number;
  isPreviewExpanded: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
  onSelectBulletin: (bulletin: BulletinRecord) => void;
  onDeleteBulletin: (id: string, studentName: string) => void;
  onTogglePreview: () => void;
  onPageChange: (page: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  bulletins,
  filteredBulletins,
  paginatedBulletins,
  selectedBulletin,
  isLoading,
  searchQuery,
  filterType,
  documentTypeCounts,
  currentPage,
  itemsPerPage,
  isPreviewExpanded,
  onSearchChange,
  onFilterChange,
  onSelectBulletin,
  onDeleteBulletin,
  onTogglePreview,
  onPageChange,
}) => {
  const { t, i18n } = useTranslation();

  // Get form type badge classes
  const getFormTypeBadgeClasses = (formType: string) => {
    const badgeColors: Record<string, string> = {
      form4: 'bg-green-100 text-green-800',
      form6: 'bg-blue-100 text-blue-800',
      collegeTranscript: 'bg-indigo-100 text-indigo-800',
      collegeAttestation: 'bg-teal-100 text-teal-800',
      stateDiploma: 'bg-purple-100 text-purple-800',
      bachelorDiploma: 'bg-amber-100 text-amber-800',
      highSchoolAttestation: 'bg-rose-100 text-rose-800',
      stateExamAttestation: 'bg-cyan-100 text-cyan-800',
    };
    return badgeColors[formType] || 'bg-blue-100 text-blue-800';
  };

  // Get form type display name
  const getFormTypeDisplayName = (formType: string) => {
    const names: Record<string, string> = {
      form4: 'Form 4',
      form6: 'Form 6',
      collegeTranscript: 'College Transcript',
      collegeAttestation: 'College Attestation',
      stateDiploma: 'State Diploma',
      bachelorDiploma: 'Bachelor Diploma',
      highSchoolAttestation: 'High School Attestation',
      stateExamAttestation: 'State Exam Attestation',
    };
    return names[formType] || 'Form 6';
  };

  // Get subtitle for bulletin card based on form type
  const getBulletinSubtitle = (bulletin: BulletinRecord) => {
    const displayData = getBulletinDisplayData(bulletin);
    const formType = bulletin.metadata.formType || 'form6';

    switch (formType) {
      case 'stateDiploma':
        const section = displayData?.section && displayData.section !== 'SECTION NAME' ? displayData.section : '';
        const option = displayData?.option && displayData.option !== 'OPTION NAME' ? displayData.option : '';
        if (section && option) return `${section} • ${option}`;
        if (section || option) return section || option;
        return 'State Diploma Certificate';
      
      case 'bachelorDiploma':
        return `${displayData?.institutionName || 'University'}${displayData?.specialization ? ' • ' + displayData.specialization : ''}`;
      
      case 'highSchoolAttestation':
        return `${displayData?.schoolName || 'School'}${displayData?.province ? ' • ' + displayData.province : ''}`;
      
      case 'stateExamAttestation':
        return `${displayData?.schoolName || 'School'}${displayData?.examSession ? ' • ' + displayData.examSession : ''}`;
      
      case 'collegeTranscript':
        return `${displayData?.institutionName || displayData?.institutionAbbreviation || 'College'}${displayData?.level ? ' • ' + displayData.level : ''}`;
      
      case 'collegeAttestation':
        const inst = displayData?.institutionName || displayData?.institutionAbbreviation || 'College';
        const yearOrAcademic = displayData?.yearLevel || displayData?.academicYear || '';
        return yearOrAcademic ? `${inst} • ${yearOrAcademic}` : inst;
      
      default:
        return `${displayData?.class || 'Unknown Class'} • ${displayData?.school || 'Unknown School'}`;
    }
  };

  const totalPages = Math.ceil(filteredBulletins.length / itemsPerPage);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      {/* Header with title and count */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">📚 {t('dashboard.bulletinsList.title')}</h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {filteredBulletins.length} {i18n.language === 'fr' ? 'sur' : 'of'} {bulletins.length} document{bulletins.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search and Filter Controls */}
      {bulletins.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={i18n.language === 'fr' ? "Rechercher par nom d'étudiant..." : 'Search by student name...'}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i18n.language === 'fr' ? 'Tous' : 'All'} ({documentTypeCounts.all || 0})
            </button>
            
            {documentTypeCounts.form4 > 0 && (
              <button
                onClick={() => onFilterChange('form4')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'form4' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Form 4 ({documentTypeCounts.form4})
              </button>
            )}
            
            {documentTypeCounts.form6 > 0 && (
              <button
                onClick={() => onFilterChange('form6')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'form6' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Form 6 ({documentTypeCounts.form6})
              </button>
            )}
            
            {documentTypeCounts.collegeTranscript > 0 && (
              <button
                onClick={() => onFilterChange('collegeTranscript')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'collegeTranscript' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {i18n.language === 'fr' ? 'Relevé Univ.' : 'Transcript'} ({documentTypeCounts.collegeTranscript})
              </button>
            )}
            
            {documentTypeCounts.collegeAttestation > 0 && (
              <button
                onClick={() => onFilterChange('collegeAttestation')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'collegeAttestation' ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                {i18n.language === 'fr' ? 'Attestation Univ.' : 'College Att.'} ({documentTypeCounts.collegeAttestation})
              </button>
            )}
            
            {documentTypeCounts.stateDiploma > 0 && (
              <button
                onClick={() => onFilterChange('stateDiploma')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'stateDiploma' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {i18n.language === 'fr' ? "Diplôme d'État" : 'State Diploma'} ({documentTypeCounts.stateDiploma})
              </button>
            )}
            
            {documentTypeCounts.bachelorDiploma > 0 && (
              <button
                onClick={() => onFilterChange('bachelorDiploma')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'bachelorDiploma' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {i18n.language === 'fr' ? 'Licence' : 'Bachelor'} ({documentTypeCounts.bachelorDiploma})
              </button>
            )}
            
            {documentTypeCounts.highSchoolAttestation > 0 && (
              <button
                onClick={() => onFilterChange('highSchoolAttestation')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'highSchoolAttestation' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {i18n.language === 'fr' ? 'Att. Scolaire' : 'HS Attestation'} ({documentTypeCounts.highSchoolAttestation})
              </button>
            )}
            
            {documentTypeCounts.stateExamAttestation > 0 && (
              <button
                onClick={() => onFilterChange('stateExamAttestation')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === 'stateExamAttestation' ? 'bg-cyan-500 text-white' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                {i18n.language === 'fr' ? 'Att. Réussite' : 'Exam Att.'} ({documentTypeCounts.stateExamAttestation})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            {i18n.language === 'fr' ? 'Chargement depuis Firestore...' : 'Loading from Firestore...'}
          </span>
        </div>
      ) : bulletins.length === 0 ? (
        /* Empty State */
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {i18n.language === 'fr' ? 'Aucun bulletin pour le moment' : 'No bulletins yet'}
          </h3>
          <p className="mt-2 text-gray-500">{t('dashboard.bulletinsList.noUploads')}</p>
        </div>
      ) : filteredBulletins.length === 0 ? (
        /* No Results State */
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {i18n.language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
          </h3>
          <p className="mt-2 text-gray-500">
            {i18n.language === 'fr'
              ? 'Essayez de modifier votre recherche ou vos filtres'
              : 'Try adjusting your search or filters'}
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onFilterChange('all');
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            {i18n.language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <>
          {/* Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedBulletins.map((bulletin) => {
              const displayData = getBulletinDisplayData(bulletin);
              const formType = bulletin.metadata.formType || 'form6';
              const isSelected = selectedBulletin?.id === bulletin.id;

              return (
                <div
                  key={bulletin.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => onSelectBulletin(bulletin)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {displayData?.studentName || bulletin.metadata.studentName || 'Unknown Student'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{getBulletinSubtitle(bulletin)}</p>
                      <p className="text-xs text-gray-500 mt-2">{bulletin.metadata.fileName || 'No filename'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {bulletin.metadata.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {/* Form Type Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormTypeBadgeClasses(formType)}`}>
                        {getFormTypeDisplayName(formType)}
                      </span>
                      
                      {/* Edited/Original Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bulletin.editedData ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bulletin.editedData ? 'Edited' : 'Original'}
                      </span>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBulletin(
                            bulletin.id,
                            displayData?.studentName || bulletin.metadata.studentName || 'Unknown Student'
                          );
                        }}
                        className="group flex items-center justify-center w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                        title={i18n.language === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <svg
                          className="w-4 h-4 text-red-500 group-hover:text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>

                      {/* Toggle Preview Button */}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePreview();
                          }}
                          className="group flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                          title={isPreviewExpanded
                            ? (i18n.language === 'fr' ? 'Masquer' : 'Hide')
                            : (i18n.language === 'fr' ? 'Afficher' : 'Show')}
                        >
                          <svg
                            className="w-4 h-4 text-gray-500 group-hover:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isPreviewExpanded ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        </button>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredBulletins.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {i18n.language === 'fr'
                  ? `Affichage ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredBulletins.length)} sur ${filteredBulletins.length}`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredBulletins.length)} of ${filteredBulletins.length}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, arr) => (
                      <React.Fragment key={page}>
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => onPageChange(page)}
                          className={`
                            w-9 h-9 rounded-lg text-sm font-medium transition-colors
                            ${currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                          `}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${currentPage >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
