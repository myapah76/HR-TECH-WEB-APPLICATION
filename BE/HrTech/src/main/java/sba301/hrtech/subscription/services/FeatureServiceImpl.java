package sba301.hrtech.subscription.services;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.subscription.abstractions.repositories.FeatureRepository;
import sba301.hrtech.subscription.abstractions.services.IFeatureService;
import sba301.hrtech.subscription.dtos.feature.request.CreateFeatureRequest;
import sba301.hrtech.subscription.dtos.feature.request.UpdateFeatureRequest;
import sba301.hrtech.subscription.dtos.feature.response.FeatureResponse;
import sba301.hrtech.subscription.entities.Feature;
import sba301.hrtech.subscription.mapper.FeatureMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FeatureServiceImpl implements IFeatureService {

    private final FeatureRepository featureRepository;

    private final FeatureMapper featureMapper;

    @Override
    public FeatureResponse create(CreateFeatureRequest request) {

        if (featureRepository.existsByCode(request.code())) {
            throw new AppException(
                    HttpStatus.BAD_GATEWAY,
                    ErrorCode.FEATURE_ALREADY_EXISTS,
                    "Feature with code '" + request.code() + "' already exists"
            );
        }

        Feature feature = featureMapper.toEntity(request);
        featureRepository.save(feature);

        return featureMapper.toResponse(feature);
    }

    @Override
    public FeatureResponse update(UUID id, UpdateFeatureRequest request) {

        Feature feature = featureRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(
                                HttpStatus.NOT_FOUND,
                                ErrorCode.FEATURE_NOT_FOUND,
                                "Feature with id '" + id + "' not found"
                        ));

        featureMapper.updateEntity(request, feature);

        return featureMapper.toResponse(feature);
    }

    @Override
    @Transactional(readOnly = true)
    public FeatureResponse getById(UUID id) {

        Feature feature = featureRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(
                                HttpStatus.NOT_FOUND,
                                ErrorCode.FEATURE_NOT_FOUND,
                                "Feature with id '" + id + "' not found"
                        ));

        return featureMapper.toResponse(feature);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeatureResponse> getAll() {

        return featureRepository.findAll()
                .stream()
                .map(featureMapper::toResponse)
                .toList();
    }

    @Override
    public void delete(UUID id) {

        Feature feature = featureRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(
                                HttpStatus.NOT_FOUND,
                                ErrorCode.FEATURE_NOT_FOUND,
                                "Feature with id '" + id + "' not found"
                        ));

        featureRepository.delete(feature);
    }
}
