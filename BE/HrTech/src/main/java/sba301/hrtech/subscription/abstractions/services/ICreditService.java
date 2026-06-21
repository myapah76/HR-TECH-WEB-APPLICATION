package sba301.hrtech.subscription.abstractions.services;

import java.util.UUID;

public interface ICreditService {

    void deductAiCredit(UUID userId, int amount);

    void deductJobQuota(UUID userId, int amount);
}
