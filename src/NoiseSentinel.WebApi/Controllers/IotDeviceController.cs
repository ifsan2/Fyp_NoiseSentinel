using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoiseSentinel.BLL.DTOs.IotDevice;
using NoiseSentinel.BLL.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NoiseSentinel.WebApi.Controllers;

/// <summary>
/// IoT Device Management Controller.
/// Handles registration, pairing, and management of IoT noise detection devices.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class IotDeviceController : ControllerBase
{
    private readonly IIotdeviceService _iotdeviceService;
    private readonly ILogger<IotDeviceController> _logger;

    public IotDeviceController(
        IIotdeviceService iotdeviceService,
        ILogger<IotDeviceController> logger)
    {
        _iotdeviceService = iotdeviceService;
        _logger = logger;
    }

    // ========================================================================
    // IOT DEVICE REGISTRATION & MANAGEMENT
    // ========================================================================

    /// <summary>
    /// Register a new IoT device (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     POST /api/iotdevice/register
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "deviceName": "IOT-LHR-001",
    ///         "firmwareVersion": "v1.2.3",
    ///         "isCalibrated": true
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">IoT device registration details</param>
    /// <returns>Registered device information</returns>
    /// <response code="200">Device registered successfully</response>
    /// <response code="400">Validation failed or device name already exists</response>
    /// <response code="401">Unauthorized - No valid token</response>
    /// <response code="403">Forbidden - Only Station Authority can register devices</response>
    [HttpPost("register")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(IotDeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterIotDeviceDto dto)
    {
        var creatorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("IoT Device registration attempt by Station Authority {CreatorId}", creatorUserId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _iotdeviceService.RegisterDeviceAsync(dto, creatorUserId);

        if (!result.Success)
        {
            _logger.LogWarning("IoT Device registration failed: {Message}", result.Message);
            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("IoT Device registered successfully: {DeviceName}", dto.DeviceName);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Get IoT device by ID.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority or Police Officer
    /// 
    /// Returns detailed information about a specific IoT device.
    /// </remarks>
    /// <param name="id">Device ID</param>
    /// <returns>Device details</returns>
    /// <response code="200">Returns device details</response>
    /// <response code="404">Device not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("{id}")]
    [Authorize(Policy = "StationRoles")]
    [ProducesResponseType(typeof(IotDeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDeviceById(int id)
    {
        var result = await _iotdeviceService.GetDeviceByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "IoT Device retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get IoT device by name.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority or Police Officer
    /// 
    /// Search for device by unique device name (e.g., IOT-LHR-001).
    /// 
    /// Sample: GET /api/iotdevice/name/IOT-LHR-001
    /// </remarks>
    /// <param name="deviceName">Device name</param>
    /// <returns>Device details</returns>
    /// <response code="200">Returns device details</response>
    /// <response code="404">Device not found</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("name/{deviceName}")]
    [Authorize(Policy = "StationRoles")]
    [ProducesResponseType(typeof(IotDeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDeviceByName(string deviceName)
    {
        var result = await _iotdeviceService.GetDeviceByNameAsync(deviceName);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(new
        {
            message = "IoT Device retrieved successfully",
            data = result.Data
        });
    }

    /// <summary>
    /// Get all IoT devices.
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority
    /// 
    /// Returns list of all registered IoT devices.
    /// </remarks>
    /// <returns>List of devices</returns>
    /// <response code="200">Returns list of devices</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("list")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(IotDeviceListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllDevices()
    {
        var result = await _iotdeviceService.GetAllDevicesAsync();

        return Ok(new
        {
            message = "IoT Devices retrieved successfully",
            count = result.Data?.Count() ?? 0,
            data = result.Data
        });
    }

    /// <summary>
    /// Get available devices for Bluetooth pairing (Police Officer).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer
    /// 
    /// Returns only calibrated and registered devices ready for use.
    /// Officers use this to see which devices they can pair with via Bluetooth.
    /// </remarks>
    /// <returns>List of available devices</returns>
    /// <response code="200">Returns available devices</response>
    /// <response code="401">Unauthorized</response>
    [HttpGet("available")]
    [Authorize(Policy = "PoliceOfficerOnly")]
    [ProducesResponseType(typeof(IotDeviceListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAvailableDevices()
    {
        var result = await _iotdeviceService.GetAvailableDevicesAsync();

        return Ok(new
        {
            message = "Available IoT Devices for pairing",
            count = result.Data?.Count() ?? 0,
            data = result.Data,
            instructions = "Select a device and pair via Bluetooth to start emission readings"
        });
    }

    /// <summary>
    /// Update IoT device (Station Authority only).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Station Authority role
    /// 
    /// Sample request:
    /// 
    ///     PUT /api/iotdevice/update
    ///     Authorization: Bearer {station-authority-token}
    ///     {
    ///         "deviceId": 1,
    ///         "deviceName": "IOT-LHR-001-UPDATED",
    ///         "firmwareVersion": "v1.3.0",
    ///         "isCalibrated": true,
    ///         "isRegistered": true
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Device update details</param>
    /// <returns>Updated device information</returns>
    /// <response code="200">Device updated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Station Authority can update</response>
    /// <response code="404">Device not found</response>
    [HttpPut("update")]
    [Authorize(Policy = "StationAuthorityOnly")]
    [ProducesResponseType(typeof(IotDeviceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDevice([FromBody] UpdateIotDeviceDto dto)
    {
        var updaterUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("IoT Device update attempt by Station Authority {UpdaterId} for Device {DeviceId}",
            updaterUserId, dto.DeviceId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _iotdeviceService.UpdateDeviceAsync(dto, updaterUserId);

        if (!result.Success)
        {
            _logger.LogWarning("IoT Device update failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new
            {
                message = result.Message,
                errors = result.Errors
            });
        }

        _logger.LogInformation("IoT Device updated successfully: {DeviceId}", dto.DeviceId);
        return Ok(new
        {
            message = result.Message,
            data = result.Data
        });
    }

    /// <summary>
    /// Pair with IoT device via Bluetooth (Police Officer).
    /// </summary>
    /// <remarks>
    /// **Authorization Required:** Police Officer
    /// 
    /// Logs when an officer pairs with a device via Bluetooth.
    /// Updates the device's last pairing timestamp.
    /// 
    /// Sample request:
    /// 
    ///     POST /api/iotdevice/pair
    ///     Authorization: Bearer {police-officer-token}
    ///     {
    ///         "deviceId": 1
    ///     }
    /// 
    /// </remarks>
    /// <param name="dto">Pairing details</param>
    /// <returns>Pairing confirmation</returns>
    /// <response code="200">Pairing successful</response>
    /// <response code="400">Device not calibrated or not registered</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Forbidden - Only Police Officers can pair</response>
    /// <response code="404">Device not found</response>
    [HttpPost("pair")]
    [Authorize(Policy = "PoliceOfficerOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PairDevice([FromBody] PairIotDeviceDto dto)
    {
        var officerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _logger.LogInformation("IoT Device pairing attempt by Police Officer {OfficerId} for Device {DeviceId}",
            officerUserId, dto.DeviceId);

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Validation failed", errors = ModelState });
        }

        var result = await _iotdeviceService.PairDeviceAsync(dto, officerUserId);

        if (!result.Success)
        {
            _logger.LogWarning("IoT Device pairing failed: {Message}", result.Message);

            if (result.Message.Contains("not found"))
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        _logger.LogInformation("IoT Device paired successfully: {DeviceId}", dto.DeviceId);
        return Ok(new
        {
            message = result.Data,
            status = "Paired",
            nextStep = "Device is ready for emission readings. You can now start detection."
        });
    }
}